import { describe, expect, it } from "vitest";
import { buildBlocks } from "@/lib/resume/build-blocks";
import { createDemoResume } from "@/lib/resume/demo";
import {
  blocksToParagraphs,
  generateDocxBuffer,
} from "@/lib/resume/generate-docx";

describe("blocksToParagraphs", () => {
  it("produces paragraphs for each demo resume block", () => {
    const blocks = buildBlocks(createDemoResume(), "geral");
    const paragraphs = blocksToParagraphs(blocks);
    expect(paragraphs.length).toBeGreaterThan(10);
  });

  it("returns an empty list when there are no blocks", () => {
    expect(blocksToParagraphs([])).toEqual([]);
  });
});

describe("generateDocxBuffer", () => {
  it("returns a zip-based DOCX buffer for the demo resume", async () => {
    const buf = await generateDocxBuffer(createDemoResume(), "geral");
    expect(buf.byteLength).toBeGreaterThan(1000);
    expect(buf[0]).toBe(0x50); // P
    expect(buf[1]).toBe(0x4b); // K — ZIP signature
  });
});
