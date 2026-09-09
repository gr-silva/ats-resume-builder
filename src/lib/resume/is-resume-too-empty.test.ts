import { describe, expect, it } from "vitest";
import { createDemoResume } from "@/lib/resume/demo";
import { isResumeTooEmpty } from "@/lib/resume/is-resume-too-empty";
import { createEmptyResume } from "@/lib/resume/schema";

describe("isResumeTooEmpty", () => {
  it("returns true for a blank resume", () => {
    expect(isResumeTooEmpty(createEmptyResume())).toBe(true);
  });

  it("returns true when name is missing but experience exists", () => {
    const data = createDemoResume();
    data.name = "   ";
    expect(isResumeTooEmpty(data)).toBe(true);
  });

  it("returns true when name exists but experiences are empty", () => {
    const data = createEmptyResume();
    data.name = "Alex Rivera";
    data.experiences = [
      {
        id: "1",
        title: "",
        company: "",
        period: "",
        bullets: ["  "],
      },
    ];
    expect(isResumeTooEmpty(data)).toBe(true);
  });

  it("returns false for the demo resume", () => {
    expect(isResumeTooEmpty(createDemoResume())).toBe(false);
  });

  it("returns false with name and one filled experience field", () => {
    const data = createEmptyResume();
    data.name = "Alex Rivera";
    data.experiences = [
      {
        id: "1",
        title: "Engineer",
        company: "",
        period: "",
        bullets: [""],
      },
    ];
    expect(isResumeTooEmpty(data)).toBe(false);
  });
});
