import { describe, expect, it } from "vitest";
import { createDemoResume } from "@/lib/resume/demo";
import { getFormProgress } from "@/lib/resume/form-progress";
import { createEmptyResume } from "@/lib/resume/schema";

describe("getFormProgress", () => {
  it("returns 0 done for a blank resume", () => {
    const progress = getFormProgress(createEmptyResume());
    expect(progress.doneCount).toBe(0);
    expect(progress.total).toBe(6);
    expect(progress.sections.dados).toBe("empty");
    expect(progress.sections.experiencia).toBe("empty");
    expect(progress.sections.extra).toBe("partial");
  });

  it("marks dados done when name is filled", () => {
    const data = createEmptyResume();
    data.name = "Alex";
    expect(getFormProgress(data).sections.dados).toBe("done");
    expect(getFormProgress(data).doneCount).toBe(1);
  });

  it("marks dados partial when only contact is filled", () => {
    const data = createEmptyResume();
    data.email = "a@b.com";
    expect(getFormProgress(data).sections.dados).toBe("partial");
    expect(getFormProgress(data).doneCount).toBe(0);
  });

  it("marks all core sections done for the demo resume", () => {
    const progress = getFormProgress(createDemoResume());
    expect(progress.sections.dados).toBe("done");
    expect(progress.sections.resumo).toBe("done");
    expect(progress.sections.skills).toBe("done");
    expect(progress.sections.experiencia).toBe("done");
    expect(progress.sections.formacao).toBe("done");
    expect(progress.doneCount).toBeGreaterThanOrEqual(5);
  });

  it("marks experiencia done with a bullet only", () => {
    const data = createEmptyResume();
    data.experiences[0]!.bullets = ["Delivered a feature"];
    expect(getFormProgress(data).sections.experiencia).toBe("done");
  });
});
