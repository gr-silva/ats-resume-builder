import { describe, expect, it } from "vitest";
import {
  buildLinkedInCopy,
  linkedInCopyToPlainText,
} from "@/lib/resume/build-linkedin-copy";
import { createDemoResume } from "@/lib/resume/demo";
import { createEmptyResume } from "@/lib/resume/schema";

describe("buildLinkedInCopy", () => {
  it("builds about from targetRole and summary", () => {
    const data = createEmptyResume();
    data.targetRole = "Software Engineer";
    data.summary = "Resumo profissional.";

    const copy = buildLinkedInCopy(data);
    expect(copy.about).toBe("Software Engineer\n\nResumo profissional.");
    expect(copy.experiences).toEqual([]);
  });

  it("omits blank about parts", () => {
    const data = createEmptyResume();
    data.summary = "Só o resumo.";
    expect(buildLinkedInCopy(data).about).toBe("Só o resumo.");
  });

  it("formats experience as title @ company with period and bullets", () => {
    const data = createEmptyResume();
    data.experiences = [
      {
        id: "exp-1",
        title: "Software Engineer",
        company: "Demo Corp",
        period: "Jan/2023 – Presente",
        bullets: ["Entrega A", "", "  Entrega B  "],
      },
    ];

    const copy = buildLinkedInCopy(data);
    expect(copy.experiences).toHaveLength(1);
    expect(copy.experiences[0]).toMatchObject({
      id: "exp-1",
      heading: "Software Engineer @ Demo Corp",
      period: "Jan/2023 – Presente",
      bullets: ["Entrega A", "Entrega B"],
    });
    expect(copy.experiences[0].body).toBe(
      ["Jan/2023 – Presente", "", "• Entrega A", "• Entrega B"].join("\n")
    );
  });

  it("uses title or company alone when the other is missing", () => {
    const data = createEmptyResume();
    data.experiences = [
      {
        id: "1",
        title: "Engenheira",
        company: "",
        period: "",
        bullets: ["Fez algo"],
      },
      {
        id: "2",
        title: "",
        company: "Acme",
        period: "2020",
        bullets: [],
      },
    ];

    const copy = buildLinkedInCopy(data);
    expect(copy.experiences.map((e) => e.heading)).toEqual([
      "Engenheira",
      "Acme",
    ]);
    expect(copy.experiences[1].body).toBe("2020");
  });

  it("skips empty experience rows", () => {
    const data = createEmptyResume();
    expect(buildLinkedInCopy(data).experiences).toEqual([]);
  });

  it("works with the demo resume", () => {
    const copy = buildLinkedInCopy(createDemoResume());
    expect(copy.about).toContain("Software Engineer");
    expect(copy.about).toContain("mais de 5 anos");
    expect(copy.experiences.length).toBeGreaterThanOrEqual(2);
    expect(copy.experiences[0].heading).toContain("@");
  });
});

describe("linkedInCopyToPlainText", () => {
  it("returns empty string when there is nothing to export", () => {
    expect(linkedInCopyToPlainText({ about: "", experiences: [] })).toBe("");
  });

  it("joins about and experiences into a downloadable text", () => {
    const text = linkedInCopyToPlainText({
      about: "Papel\n\nResumo",
      experiences: [
        {
          id: "1",
          heading: "Dev @ Corp",
          period: "2024",
          bullets: ["Feito"],
          body: "2024\n\n• Feito",
        },
      ],
    });

    expect(text).toContain("SOBRE");
    expect(text).toContain("Papel\n\nResumo");
    expect(text).toContain("EXPERIÊNCIA");
    expect(text).toContain("Dev @ Corp");
    expect(text).toContain("• Feito");
    expect(text.endsWith("\n")).toBe(true);
  });
});
