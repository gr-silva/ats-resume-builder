import { describe, expect, it } from "vitest";
import {
  appendSkillChip,
  joinSkillChips,
  parseSkillChips,
} from "@/lib/resume/skill-chips";

describe("skill chips", () => {
  it("parses comma-separated items", () => {
    expect(parseSkillChips("TypeScript,  JavaScript,Python")).toEqual([
      "TypeScript",
      "JavaScript",
      "Python",
    ]);
  });

  it("joins chips with comma+space", () => {
    expect(joinSkillChips(["A", " B ", ""])).toBe("A, B");
  });

  it("appends a new chip and rejects duplicates", () => {
    expect(appendSkillChip(["React"], " Next.js ")).toEqual([
      "React",
      "Next.js",
    ]);
    expect(appendSkillChip(["React"], "react")).toBeNull();
    expect(appendSkillChip(["React"], "  ")).toBeNull();
  });
});
