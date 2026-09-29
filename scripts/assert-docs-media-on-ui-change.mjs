/**
 * Fails on PRs when UI sources change but docs/media does not.
 * Usage: node scripts/assert-docs-media-on-ui-change.mjs <baseSha> <headSha>
 */
import { execFileSync } from "node:child_process";

const UI_GLOBS = ["src/app/", "src/components/"];
const MEDIA_PREFIX = "docs/media/";

const base = process.argv[2];
const head = process.argv[3];

if (!base || !head) {
  console.error("Usage: node scripts/assert-docs-media-on-ui-change.mjs <baseSha> <headSha>");
  process.exit(2);
}

function changedFiles(from, to) {
  const out = execFileSync(
    "git",
    ["diff", "--name-only", `${from}...${to}`],
    { encoding: "utf8" },
  );
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

const files = changedFiles(base, head);
const uiChanged = files.some((f) => UI_GLOBS.some((p) => f.startsWith(p)));
const mediaChanged = files.some((f) => f.startsWith(MEDIA_PREFIX));

if (uiChanged && !mediaChanged) {
  console.error(
    "UI sources changed without updating docs/media.\n" +
      "Changed UI paths:\n" +
      files
        .filter((f) => UI_GLOBS.some((p) => f.startsWith(p)))
        .map((f) => `  - ${f}`)
        .join("\n") +
      "\n\nRun locally and commit the media:\n" +
      "  npm run build && npm run start\n" +
      "  APP_URL=http://127.0.0.1:3000 npm run capture:media",
  );
  process.exit(1);
}

if (uiChanged) {
  console.log("UI changed and docs/media is included in this PR — OK.");
} else {
  console.log("No UI path changes — docs/media refresh not required.");
}
