import { hasLanguageModelApi } from "@/lib/ai/language-model-api";
import { chromePromptProvider } from "@/lib/ai/providers/chrome-prompt";
import type { AiProvider } from "@/lib/ai/types";

export function getChromeAiProvider(): AiProvider | null {
  if (typeof window === "undefined") return null;
  if (!hasLanguageModelApi()) return null;
  return chromePromptProvider;
}

export { chromePromptProvider };
