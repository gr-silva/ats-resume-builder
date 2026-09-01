import { describe, expect, it } from "vitest";
import { AiParseError } from "@/lib/ai/types";
import {
  parseStarBulletAnalysis,
  parseStarExperienceAnalysis,
  parseStarJsonResponse,
  parseStarRewrite,
} from "@/lib/ai/parse-star-response";

const validComponent = { text: "Contexto", status: "clear" as const };

const validBulletAnalysis = {
  bulletIndex: 0,
  original: "Fiz X",
  situation: validComponent,
  task: validComponent,
  action: validComponent,
  result: { text: "40%", status: "clear" as const },
  suggestions: ["Adicionar métrica"],
  questions: [
    {
      component: "result",
      question: "Qual foi o impacto?",
      hint: "Use números",
    },
  ],
};

describe("parseStarExperienceAnalysis", () => {
  it("parses valid analysis", () => {
    const result = parseStarExperienceAnalysis({
      bullets: [validBulletAnalysis],
    });
    expect(result?.bullets).toHaveLength(1);
    expect(result?.bullets[0].bulletIndex).toBe(0);
    expect(result?.bullets[0].questions[0].component).toBe("result");
  });

  it("returns null for invalid payload", () => {
    expect(parseStarExperienceAnalysis(null)).toBeNull();
    expect(parseStarExperienceAnalysis({ bullets: [] })).toBeNull();
  });
});

describe("parseStarBulletAnalysis", () => {
  it("returns first bullet from analysis", () => {
    const result = parseStarBulletAnalysis({ bullets: [validBulletAnalysis] });
    expect(result?.original).toBe("Fiz X");
  });
});

describe("parseStarRewrite", () => {
  it("parses valid rewrites", () => {
    const result = parseStarRewrite({
      rewrites: [
        {
          bulletIndex: 0,
          original: "Fiz X",
          rewritten: "Desenvolvi X, reduzindo Y em 40%.",
          breakdown: {
            situation: "Legado instável",
            task: "Modernizar",
            action: "Migração com TypeScript",
            result: "40% menos incidentes",
          },
        },
      ],
    });
    expect(result).toHaveLength(1);
    expect(result?.[0].rewritten).toContain("40%");
  });

  it("returns null when rewrites empty", () => {
    expect(parseStarRewrite({ rewrites: [] })).toBeNull();
  });
});

describe("parseStarJsonResponse", () => {
  it("extracts JSON from text wrapper", () => {
    const json = JSON.stringify({ bullets: [validBulletAnalysis] });
    const result = parseStarJsonResponse(json, parseStarExperienceAnalysis);
    expect(result.bullets).toHaveLength(1);
  });

  it("throws AiParseError on invalid JSON", () => {
    expect(() =>
      parseStarJsonResponse("not json", parseStarExperienceAnalysis)
    ).toThrow(AiParseError);
  });
});
