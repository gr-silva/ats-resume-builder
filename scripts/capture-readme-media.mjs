/**
 * Captures README (GitHub), form-tab screenshots, mobile, and demo video.
 *
 * Run locally after UI changes (CI does not regenerate — it only validates):
 *   npx playwright install chromium && npm run build && npm run start
 *   APP_URL=http://127.0.0.1:3000 npm run capture:media
 *
 * Demo video: Playwright records WebM, then ffmpeg-static converts to H.264 MP4
 * (skips the opening load flash so the first frame / thumbnail shows the UI).
 *
 * Env:
 *   APP_URL — app base URL (default production)
 *   SKIP_README_CAPTURE=1 — skip GitHub README screenshot
 */
import { chromium } from "playwright";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readdir, unlink } from "node:fs/promises";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { promisify } from "node:util";
import { homedir, platform } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MEDIA_DIR = path.join(ROOT, "docs", "media");

const APP_URL =
  process.env.APP_URL ?? "https://ats-resume-builder-topaz.vercel.app";
const FALLBACK_APP_URL = "https://rocha-resume-builder.vercel.app";
const GITHUB_README =
  "https://github.com/gr-silva/ats-resume-builder#readme";
const SKIP_README_CAPTURE = process.env.SKIP_README_CAPTURE === "1";

/** @type {{ label: string; slug: string }[]} */
const FORM_TABS = [
  { label: "Dados", slug: "dados" },
  { label: "Resumo", slug: "resumo" },
  { label: "Skills", slug: "skills" },
  { label: "Experiência", slug: "experiencia" },
  { label: "Formação", slug: "formacao" },
  { label: "Extra", slug: "extra" },
];

const LEGACY_MEDIA = [
  "passou-app-home.png",
  "passou-app-form-demo.png",
  "passou-app-pdf-preview.png",
  "passou-app-mobile.png",
  "passou-demo.webm",
];

const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const VIDEO_VIEWPORT = { width: 1280, height: 720 };

/** @returns {import("playwright").Browser} */
async function launchBrowser() {
  /** @type {Array<{ name: string, run: () => Promise<import("playwright").Browser> }>} */
  const attempts = [
    {
      name: "system Chrome",
      run: () =>
        chromium.launch({
          headless: true,
          channel: "chrome",
          args: ["--disable-dev-shm-usage"],
        }),
    },
    {
      name: "Playwright Chromium",
      run: () => chromium.launch({ headless: true }),
    },
    {
      name: "cached Chromium",
      run: () => {
        const executablePath = findCachedChromiumExecutable();
        if (!executablePath) {
          throw new Error("No cached Playwright Chromium found");
        }
        return chromium.launch({ headless: true, executablePath });
      },
    },
  ];

  const errors = [];
  for (const attempt of attempts) {
    try {
      const browser = await attempt.run();
      console.log(`Browser: ${attempt.name}`);
      return browser;
    } catch (err) {
      errors.push(`${attempt.name}: ${err instanceof Error ? err.message : err}`);
    }
  }
  throw new Error(`Failed to launch browser:\n${errors.join("\n")}`);
}

function playwrightCacheRoot() {
  if (platform() === "darwin") {
    return path.join(homedir(), "Library", "Caches", "ms-playwright");
  }
  return path.join(homedir(), ".cache", "ms-playwright");
}

function findCachedChromiumExecutable() {
  const cacheRoot = playwrightCacheRoot();
  if (!existsSync(cacheRoot)) return undefined;

  const dirs = readdirSync(cacheRoot)
    .filter((name) => /^chromium-\d+$/.test(name))
    .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));

  for (const dir of dirs) {
    const candidates = [
      path.join(
        cacheRoot,
        dir,
        "chrome-linux",
        "chrome",
      ),
      path.join(
        cacheRoot,
        dir,
        "chrome-mac-arm64",
        "Google Chrome for Testing.app",
        "Contents",
        "MacOS",
        "Google Chrome for Testing",
      ),
      path.join(
        cacheRoot,
        dir,
        "chrome-mac",
        "Google Chrome for Testing.app",
        "Contents",
        "MacOS",
        "Google Chrome for Testing",
      ),
    ];
    for (const candidate of candidates) {
      if (existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

async function resolveAppUrl(page) {
  for (const url of [APP_URL, FALLBACK_APP_URL]) {
    try {
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      if (response && response.ok()) return url;
    } catch {
      /* try next */
    }
  }
  return APP_URL;
}

function formSection(page) {
  return page.locator("section").filter({
    has: page.getByRole("heading", { name: "Seus dados" }),
  });
}

async function clickFormTab(page, label) {
  await formSection(page).getByRole("tab", { name: label, exact: true }).click();
}

async function loadDemo(page, appUrl) {
  await page.goto(appUrl, { waitUntil: "networkidle", timeout: 120_000 });
  await page.getByRole("button", { name: /Carregar demo/i }).click();
  await page
    .getByRole("button", { name: /^Carregar demo$/i })
    .last()
    .click();
  await page.waitForTimeout(600);
}

/** Scroll the main page ScrollArea so the form section sits near the top of the viewport. */
async function scrollFormIntoView(page) {
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll("h2")).find(
      (el) => el.textContent?.trim() === "Seus dados",
    );
    const target = heading?.closest("section") ?? heading;
    if (!target) return;

    const pageViewport = document.querySelector(
      "body > [data-radix-scroll-area-root] [data-radix-scroll-area-viewport], body [data-radix-scroll-area-viewport]",
    );
    // Prefer the outermost scroll viewport (page chrome), not nested preview ones.
    const viewports = Array.from(
      document.querySelectorAll("[data-radix-scroll-area-viewport]"),
    );
    const scrollRoot =
      viewports.find((vp) => vp.contains(target) && vp.clientHeight > 400) ??
      pageViewport ??
      viewports[0];

    if (scrollRoot) {
      const rootRect = scrollRoot.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const nextTop =
        scrollRoot.scrollTop + (targetRect.top - rootRect.top) - 16;
      scrollRoot.scrollTop = Math.max(0, nextTop);
    } else {
      target.scrollIntoView({ block: "start", behavior: "instant" });
    }
  });
  await page.waitForTimeout(250);
}

async function scrollToTop(page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    for (const viewport of document.querySelectorAll(
      "[data-radix-scroll-area-viewport]",
    )) {
      viewport.scrollTop = 0;
    }
  });
  await page.waitForTimeout(150);
}

async function scrollPageGradually(page, steps = 6, pauseMs = 350) {
  const maxScroll = await page.evaluate(() => {
    const viewport = document.querySelector("[data-radix-scroll-area-viewport]");
    if (viewport) {
      return Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    }
    return Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
  });
  for (let i = 0; i <= steps; i++) {
    const y = Math.round((maxScroll * i) / steps);
    await page.evaluate((top) => {
      const viewport = document.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) viewport.scrollTop = top;
      else window.scrollTo(0, top);
    }, y);
    await page.waitForTimeout(pauseMs);
  }
}

/**
 * Viewport shot (same scale as the demo video) — scroll form into view so the
 * active tab is readable, without stretching the page into a giant tall image.
 */
async function viewportScreenshot(page, filename) {
  await scrollFormIntoView(page);
  await page.screenshot({
    path: path.join(MEDIA_DIR, filename),
    fullPage: false,
  });
}

async function removeLegacyMedia() {
  await Promise.all(
    LEGACY_MEDIA.map(async (name) => {
      const file = path.join(MEDIA_DIR, name);
      if (existsSync(file)) await unlink(file);
    }),
  );
}

async function captureFormTabScreenshots(page, appUrl) {
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await loadDemo(page, appUrl);

  for (const { label, slug } of FORM_TABS) {
    await clickFormTab(page, label);
    await page.waitForTimeout(500);
    await viewportScreenshot(page, `passou-tab-${slug}.png`);
    console.log(`  tab ${label}`);
  }
}

async function captureMobileScreenshot(page, appUrl) {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await loadDemo(page, appUrl);
  await clickFormTab(page, "Dados");
  await page.waitForTimeout(400);
  await viewportScreenshot(page, "passou-mobile.png");
  console.log("  mobile");
}

function findFfmpegExecutable() {
  try {
    // Prefer full ffmpeg (H.264/MP4). Playwright's bundled build only does WebM/VP8.
    const ffmpegStatic = require("ffmpeg-static");
    if (typeof ffmpegStatic === "string" && existsSync(ffmpegStatic)) {
      return ffmpegStatic;
    }
  } catch {
    /* optional */
  }

  const cacheRoot = playwrightCacheRoot();
  if (existsSync(cacheRoot)) {
    const dirs = readdirSync(cacheRoot)
      .filter((name) => /^ffmpeg-\d+$/.test(name))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
    for (const dir of dirs) {
      const candidates = [
        path.join(cacheRoot, dir, "ffmpeg-mac"),
        path.join(cacheRoot, dir, "ffmpeg-linux"),
        path.join(cacheRoot, dir, "ffmpeg-win64.exe"),
        path.join(cacheRoot, dir, "ffmpeg"),
      ];
      for (const candidate of candidates) {
        if (existsSync(candidate)) return candidate;
      }
    }
  }
  return "ffmpeg";
}

/** Playwright records WebM; convert to MP4 (H.264) for broader playback.
 *  Skips the opening load flash so the first frame (and video thumbnails) show the UI. */
async function convertWebmToMp4(webmPath, mp4Path, { startSeconds = 2 } = {}) {
  const ffmpeg = findFfmpegExecutable();
  await execFileAsync(
    ffmpeg,
    [
      "-y",
      "-ss",
      String(startSeconds),
      "-i",
      webmPath,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-an",
      mp4Path,
    ],
    { maxBuffer: 20 * 1024 * 1024 },
  );
}

async function removePlaywrightVideoArtifacts() {
  const entries = await readdir(MEDIA_DIR);
  await Promise.all(
    entries
      .filter(
        (name) =>
          (name.startsWith("page@") && name.endsWith(".webm")) ||
          name === "passou-demo.webm",
      )
      .map((name) => unlink(path.join(MEDIA_DIR, name))),
  );
}

async function pause(page, ms) {
  await page.waitForTimeout(ms);
}

async function captureAppVideo(browser, appUrl) {
  const context = await browser.newContext({
    viewport: VIDEO_VIEWPORT,
    recordVideo: {
      dir: MEDIA_DIR,
      size: VIDEO_VIEWPORT,
    },
  });
  const page = await context.newPage();

  await page.goto(appUrl, { waitUntil: "networkidle", timeout: 120_000 });
  await page.getByRole("heading", { name: "Passou", exact: true }).waitFor({
    state: "visible",
    timeout: 60_000,
  });
  // Hold on the loaded UI so, after trimming the load flash, the first frames are usable.
  await pause(page, 2000);

  await page.getByRole("button", { name: /^Começar$/i }).click();
  await pause(page, 1200);

  await page.getByRole("button", { name: /Carregar demo/i }).click();
  await page
    .getByRole("button", { name: /^Carregar demo$/i })
    .last()
    .click();
  await pause(page, 1200);

  for (const { label } of FORM_TABS) {
    await clickFormTab(page, label);
    await pause(page, 800);
    await scrollPageGradually(page, 4, 400);
    await scrollToTop(page);
    await pause(page, 600);
  }

  // Preview lives in <aside>, not <section> (form is the section).
  const previewPanel = page.locator("aside").filter({
    has: page.getByRole("heading", { name: "Preview" }),
  });
  await previewPanel.getByRole("tab", { name: "PDF", exact: true }).click();
  await pause(page, 2000);
  await scrollPageGradually(page, 3, 350);
  await scrollToTop(page);
  await pause(page, 800);

  await previewPanel.getByRole("tab", { name: "Markdown", exact: true }).click();
  await pause(page, 1800);
  await scrollPageGradually(page, 2, 350);
  await scrollToTop(page);
  await pause(page, 1000);

  const video = page.video();
  await context.close();
  if (video) {
    const webmPath = path.join(MEDIA_DIR, "passou-demo.webm");
    const mp4Path = path.join(MEDIA_DIR, "passou-demo.mp4");
    await video.saveAs(webmPath);
    console.log("  converting WebM → MP4…");
    await convertWebmToMp4(webmPath, mp4Path);
  }
  await removePlaywrightVideoArtifacts();
}

async function captureGithubReadme(page) {
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await page.goto(GITHUB_README, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.waitForTimeout(2000);

  const readme = page.locator("#readme");
  if ((await readme.count()) > 0) {
    await readme.screenshot({
      path: path.join(MEDIA_DIR, "readme-github.png"),
    });
  } else {
    await page.screenshot({
      path: path.join(MEDIA_DIR, "readme-github.png"),
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 900 },
    });
  }
}

async function main() {
  await mkdir(MEDIA_DIR, { recursive: true });
  await removeLegacyMedia();

  const browser = await launchBrowser();
  const page = await browser.newPage();
  const appUrl = await resolveAppUrl(page);
  console.log(`Using app URL: ${appUrl}`);

  if (!SKIP_README_CAPTURE) {
    console.log("Capturing GitHub README…");
    await captureGithubReadme(page);
  } else {
    console.log("Skipping GitHub README (SKIP_README_CAPTURE=1)");
  }

  console.log("Capturing form tabs (full page)…");
  await captureFormTabScreenshots(page, appUrl);

  console.log("Capturing mobile (full page)…");
  await captureMobileScreenshot(page, appUrl);

  console.log("Recording demo video…");
  await captureAppVideo(browser, appUrl);

  await browser.close();
  console.log(`Done. Files in ${MEDIA_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
