import { describe, expect, it } from "vitest";
import { mergeAiIntoResume, parseAiResumeOutput } from "@/lib/ai/merge-resume";
import { parseJsonResponse } from "@/lib/ai/parse-json-response";
import { AiParseError } from "@/lib/ai/types";
import { createEmptyResume } from "@/lib/resume/schema";

describe("parseAiResumeOutput", () => {
  it("parses valid resume shape", () => {
    const result = parseAiResumeOutput({
      name: "Maria Silva",
      targetRole: "Dev",
      location: "SP",
      phone: "",
      email: "maria@example.com",
      linkedin: "",
      portfolio: "",
      summary: "Resumo",
      skillCategories: [{ name: "Linguagens", items: "TS" }],
      experiences: [
        {
          title: "Dev",
          company: "Acme",
          period: "2022–",
          bullets: ["Entreguei X"],
        },
      ],
      education: [
        { degree: "CC", institution: "USP", period: "2018–2022" },
      ],
      courses: [],
      languages: [{ name: "Português", level: "Nativo" }],
      availability: "Remoto",
    });

    expect(result?.name).toBe("Maria Silva");
    expect(result?.experiences).toHaveLength(1);
  });

  it("returns null for invalid input", () => {
    expect(parseAiResumeOutput(null)).toBeNull();
    expect(parseAiResumeOutput("text")).toBeNull();
  });
});

describe("parseJsonResponse", () => {
  it("extracts JSON from text with surrounding noise", () => {
    const json = JSON.stringify({
      name: "João",
      targetRole: "Eng",
      location: "",
      phone: "",
      email: "",
      linkedin: "",
      portfolio: "",
      summary: "",
      skillCategories: [],
      experiences: [],
      education: [],
      courses: [],
      languages: [],
      availability: "",
    });

    const result = parseJsonResponse(`Aqui está:\n${json}\nFim.`);
    expect(result.name).toBe("João");
  });

  it("throws AiParseError for invalid JSON", () => {
    expect(() => parseJsonResponse("not json")).toThrow(AiParseError);
  });
});

describe("mergeAiIntoResume", () => {
  it("merges AI output into current resume with generated ids", () => {
    const current = createEmptyResume();
    const merged = mergeAiIntoResume(current, {
      name: "Ana Costa",
      targetRole: "Frontend",
      location: "RJ",
      phone: "",
      email: "ana@example.com",
      linkedin: "",
      portfolio: "",
      summary: "5 anos em React",
      skillCategories: [{ name: "Front-end", items: "React, Next.js" }],
      experiences: [
        {
          title: "Frontend Dev",
          company: "Beta",
          period: "2021–",
          bullets: ["Melhorei performance em 30%"],
        },
      ],
      education: [
        { degree: "Sistemas", institution: "UFX", period: "2015–2019" },
      ],
      courses: [{ text: "React Avançado" }],
      languages: [{ name: "Inglês", level: "Avançado" }],
      availability: "Remoto",
    });

    expect(merged.name).toBe("Ana Costa");
    expect(merged.skillCategories[0].id).toBeTruthy();
    expect(merged.experiences[0].bullets[0]).toContain("30%");
    expect(merged.focus).toBe("geral");
  });
});
