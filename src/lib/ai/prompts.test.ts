import { describe, expect, it } from "vitest";
import {
  buildStarAnalyzeBulletPrompt,
  buildStarAnalyzeExperiencePrompt,
  buildStarRewritePrompt,
} from "@/lib/ai/prompts";

const context = {
  title: "Software Engineer",
  company: "Demo Corp",
  period: "2023 – Presente",
};

describe("STAR prompts", () => {
  it("includes experience context in bullet analyze prompt", () => {
    const prompt = buildStarAnalyzeBulletPrompt(context, "Fiz automação", 0);
    expect(prompt).toContain("Software Engineer");
    expect(prompt).toContain("Demo Corp");
    expect(prompt).toContain("Fiz automação");
    expect(prompt).toContain("bulletIndex 0");
    expect(prompt).toContain('"issue"');
    expect(prompt).toContain('"idea"');
    expect(prompt).toContain("SEM números ou percentuais fictícios");
    expect(prompt).toContain("NÃO invente");
  });

  it("includes bullet indices in experience analyze prompt", () => {
    const prompt = buildStarAnalyzeExperiencePrompt(context, [
      "Bullet 0",
      "",
      "Bullet 2",
    ]);
    expect(prompt).toContain("0. Bullet 0");
    expect(prompt).toContain("Índices a analisar: 0, 2");
  });

  it("includes user answers in rewrite prompt", () => {
    const prompt = buildStarRewritePrompt(
      context,
      [{ bulletIndex: 0, original: "Fiz X" }],
      [
        {
          bulletIndex: 0,
          component: "result",
          answer: "Redução de 30% no tempo",
        },
      ]
    );
    expect(prompt).toContain("Redução de 30% no tempo");
    expect(prompt).toContain("result");
    expect(prompt).toContain("Não invente");
    expect(prompt).toContain("APENAS os bullets listados");
  });

  it("includes selected suggestions with and without values", () => {
    const withValue = buildStarRewritePrompt(
      context,
      [{ bulletIndex: 0, original: "Automatizei rotinas" }],
      undefined,
      [
        {
          bulletIndex: 0,
          issue: "Falta especificar rotinas",
          idea: "Inclua o número de rotinas ou o impacto",
          value: "3 rotinas de onboarding",
        },
      ]
    );
    expect(withValue).toContain("Sugestões que o usuário pediu para incluir");
    expect(withValue).toContain("3 rotinas de onboarding");
    expect(withValue).toContain("Inclua o número de rotinas");

    const withoutValue = buildStarRewritePrompt(
      context,
      [{ bulletIndex: 1, original: "Melhorei o processo" }],
      undefined,
      [
        {
          bulletIndex: 1,
          issue: "Sem métrica",
          idea: "Considere citar redução de tempo",
          value: "",
        },
      ]
    );
    expect(withoutValue).toContain("(não informado");
    expect(withoutValue).toContain("SEM inventar números");
    expect(withoutValue).toContain("Considere citar redução de tempo");
  });
});
