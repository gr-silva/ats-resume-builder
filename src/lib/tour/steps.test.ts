import { describe, expect, it } from "vitest";
import { FORM_TAB_IDS } from "@/lib/resume/form-progress";
import { PASSARU_POSES } from "@/lib/tour/poses";
import {
  OPTIONAL_TOUR_IDS,
  REQUIRED_TOUR_IDS,
  TOUR_STEPS,
  toDriverSteps,
} from "@/lib/tour/steps";

describe("tour steps", () => {
  it("covers every required interactive region", () => {
    const ids = TOUR_STEPS.map((step) => step.id);
    expect(ids).toEqual(expect.arrayContaining([...REQUIRED_TOUR_IDS]));
  });

  it("marks AI-only steps as optional", () => {
    for (const id of OPTIONAL_TOUR_IDS) {
      const step = TOUR_STEPS.find((item) => item.id === id);
      expect(step, id).toBeDefined();
      expect(step?.optional).toBe(true);
    }
  });

  it("pairs every step with a known Passaru pose and copy", () => {
    for (const step of TOUR_STEPS) {
      expect(step.pose in PASSARU_POSES, step.id).toBe(true);
      expect(step.title.trim().length).toBeGreaterThan(0);
      expect(step.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("only switches to real form tabs", () => {
    for (const step of TOUR_STEPS) {
      if (!step.tab) continue;
      expect(FORM_TAB_IDS).toContain(step.tab);
    }
  });

  it("keeps required steps on screen without optional flag", () => {
    for (const id of REQUIRED_TOUR_IDS) {
      const step = TOUR_STEPS.find((item) => item.id === id);
      expect(step?.optional).toBeFalsy();
    }
  });

  it("drops Chrome-only steps when AI is unavailable", () => {
    const ids = toDriverSteps(() => {}, { aiSupported: false }).map(
      (step) => step.data?.id
    );
    expect(ids).toContain("ai-hint");
    expect(ids).not.toContain("wizard");
    expect(ids).not.toContain("import");
    expect(ids).not.toContain("star-ai");
    expect(ids).toEqual(expect.arrayContaining([...REQUIRED_TOUR_IDS]));
  });

  it("includes Chrome AI controls when supported", () => {
    const ids = toDriverSteps(() => {}, { aiSupported: true }).map(
      (step) => step.data?.id
    );
    expect(ids).toContain("wizard");
    expect(ids).toContain("import");
    expect(ids).toContain("star-ai");
    expect(ids).not.toContain("ai-hint");
  });
});
