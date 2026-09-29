/**
 * CI guard for docs/media: required files exist, non-empty, expected PNG sizes.
 * Does not regenerate assets (that is local: npm run capture:media).
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA = path.join(ROOT, "docs", "media");
const PUBLIC_DEMO = path.join(ROOT, "public", "passou-demo.mp4");

const MIN_MP4_BYTES = 100 * 1024;

/** @type {{ file: string, width?: number, height?: number, minBytes?: number }[]} */
const REQUIRED = [
  { file: "passou-demo.mp4", minBytes: MIN_MP4_BYTES },
  { file: "passou-mobile.png", width: 390, height: 844 },
  { file: "passou-tab-dados.png", width: 1280, height: 720 },
  { file: "passou-tab-resumo.png", width: 1280, height: 720 },
  { file: "passou-tab-skills.png", width: 1280, height: 720 },
  { file: "passou-tab-experiencia.png", width: 1280, height: 720 },
  { file: "passou-tab-formacao.png", width: 1280, height: 720 },
  { file: "passou-tab-extra.png", width: 1280, height: 720 },
  { file: "readme-github.png", minBytes: 10 * 1024 },
];

function pngDimensions(filePath) {
  const buf = readFileSync(filePath);
  if (buf.length < 24 || buf.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`${filePath} is not a PNG`);
  }
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function assertMedia() {
  const errors = [];

  for (const spec of REQUIRED) {
    const filePath = path.join(MEDIA, spec.file);
    if (!existsSync(filePath)) {
      errors.push(`missing: docs/media/${spec.file}`);
      continue;
    }
    const { size } = statSync(filePath);
    if (size <= 0) {
      errors.push(`empty: docs/media/${spec.file}`);
      continue;
    }
    if (spec.minBytes != null && size < spec.minBytes) {
      errors.push(
        `too small: docs/media/${spec.file} (${size} bytes, min ${spec.minBytes})`,
      );
    }
    if (spec.width != null && spec.height != null) {
      try {
        const { width, height } = pngDimensions(filePath);
        if (width !== spec.width || height !== spec.height) {
          errors.push(
            `bad dimensions: docs/media/${spec.file} is ${width}x${height}, expected ${spec.width}x${spec.height}`,
          );
        }
      } catch (err) {
        errors.push(
          `unreadable PNG: docs/media/${spec.file} (${err instanceof Error ? err.message : err})`,
        );
      }
    }
  }

  if (errors.length) {
    console.error("docs/media check failed:");
    for (const e of errors) console.error(`  - ${e}`);
    console.error(
      "\nRegenerate locally: npm run build && npm run start\n  APP_URL=http://127.0.0.1:3000 npm run capture:media",
    );
    process.exit(1);
  }

  if (!existsSync(PUBLIC_DEMO) || statSync(PUBLIC_DEMO).size < MIN_MP4_BYTES) {
    console.error(
      "missing or too small: public/passou-demo.mp4 (needed for README demo link on Vercel)",
    );
    process.exit(1);
  }

  console.log("docs/media OK (required files, sizes, PNG dimensions).");
  console.log("public/passou-demo.mp4 OK.");
}

assertMedia();
