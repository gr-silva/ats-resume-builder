/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  chromePromptProvider,
  resetChromePromptProviderForTests,
} from "@/lib/ai/providers/chrome-prompt";

describe("chromePromptProvider", () => {
  const mockPrompt = vi.fn();
  const mockDestroy = vi.fn();

  beforeEach(() => {
    resetChromePromptProviderForTests();
    mockPrompt.mockReset();
    mockDestroy.mockReset();

    vi.stubGlobal("LanguageModel", {
      availability: vi.fn().mockResolvedValue("downloadable"),
      create: vi.fn().mockResolvedValue({
        prompt: mockPrompt,
        destroy: mockDestroy,
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetChromePromptProviderForTests();
  });

  it("prepare marks provider as ready", async () => {
    expect(chromePromptProvider.isReady()).toBe(false);
    await chromePromptProvider.prepare();
    expect(chromePromptProvider.isReady()).toBe(true);
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("retries generation when first JSON response is invalid", async () => {
    mockPrompt
      .mockResolvedValueOnce("not-json")
      .mockResolvedValueOnce(
        JSON.stringify({
          name: "Test User",
          targetRole: "Engineer",
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
        })
      );

    const result = await chromePromptProvider.generateResume("gere um currículo");
    expect(result.name).toBe("Test User");
    expect(mockPrompt).toHaveBeenCalledTimes(2);
  });

  it("retries generateJson when first STAR response is invalid", async () => {
    mockPrompt
      .mockResolvedValueOnce("not-json")
      .mockResolvedValueOnce(
        JSON.stringify({
          rewrites: [
            {
              bulletIndex: 0,
              original: "Fiz X",
              rewritten: "Desenvolvi X com impacto mensurável.",
              breakdown: {
                situation: "Contexto",
                task: "Objetivo",
                action: "Implementação",
                result: "Impacto",
              },
            },
          ],
        })
      );

    const result = await chromePromptProvider.generateJson(
      "reescreva star",
      { type: "object" },
      (raw) => {
        if (!raw || typeof raw !== "object") return null;
        const o = raw as { rewrites?: unknown[] };
        return Array.isArray(o.rewrites) ? o.rewrites : null;
      }
    );

    expect(result).toHaveLength(1);
    expect(mockPrompt).toHaveBeenCalledTimes(2);
  });
});
