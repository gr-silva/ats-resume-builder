import { chromePromptProvider } from "@/lib/ai/providers/chrome-prompt";
import type { AiProvider } from "@/lib/ai/types";

export function getChromeAiProvider(): AiProvider | null {
  if (typeof window === "undefined") return null;
  if (typeof LanguageModel === "undefined") return null;
  return chromePromptProvider;
}

export { chromePromptProvider };
