import { describe, expect, it } from "vitest";
import { applyStarRewrite } from "@/lib/ai/apply-star-rewrite";
import type { Experience } from "@/lib/resume/schema";

const experience: Experience = {
  id: "exp-1",
  title: "Engineer",
  company: "Corp",
  period: "2023",
  bullets: ["Bullet original 0", "Bullet original 1"],
};

describe("applyStarRewrite", () => {
  it("replaces bullets by index", () => {
    const result = applyStarRewrite(experience, [
      {
        bulletIndex: 0,
        original: "Bullet original 0",
        rewritten: "Bullet reescrito 0",
        breakdown: {
          situation: "",
          task: "",
          action: "",
          result: "",
        },
      },
      {
        bulletIndex: 1,
        original: "Bullet original 1",
        rewritten: "Bullet reescrito 1",
        breakdown: {
          situation: "",
          task: "",
          action: "",
          result: "",
        },
      },
    ]);

    expect(result.bullets).toEqual(["Bullet reescrito 0", "Bullet reescrito 1"]);
    expect(result.id).toBe("exp-1");
  });

  it("ignores out-of-range indices and empty rewrites", () => {
    const result = applyStarRewrite(experience, [
      {
        bulletIndex: 5,
        original: "",
        rewritten: "Ignorado",
        breakdown: {
          situation: "",
          task: "",
          action: "",
          result: "",
        },
      },
      {
        bulletIndex: 0,
        original: "",
        rewritten: "   ",
        breakdown: {
          situation: "",
          task: "",
          action: "",
          result: "",
        },
      },
    ]);

    expect(result.bullets[0]).toBe("Bullet original 0");
  });

  it("returns same experience when rewrites empty", () => {
    expect(applyStarRewrite(experience, [])).toBe(experience);
  });
});
