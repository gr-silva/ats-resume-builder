import type { AiAvailability } from "@/lib/ai/types";

export type RawLanguageModelAvailability =
  | AiAvailability
  | "readily"
  | "no"
  | "after-download"
  | "readily-available";

export interface LanguageModelApi {
  availability?: () => Promise<RawLanguageModelAvailability | string>;
  create?: (options?: {
    monitor?: (monitor: EventTarget) => void;
  }) => Promise<LanguageModelSession>;
}

export interface LanguageModelSession {
  prompt?: (
    input: string,
    options?: { responseConstraint?: Record<string, unknown> }
  ) => Promise<string>;
  destroy?: () => void;
}

export function getLanguageModelApi(): LanguageModelApi | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    LanguageModel?: LanguageModelApi;
    ai?: { languageModel?: LanguageModelApi };
  };
  return w.LanguageModel ?? w.ai?.languageModel ?? null;
}

export function hasLanguageModelApi(): boolean {
  return getLanguageModelApi() != null;
}

export function normalizeAvailability(
  raw: RawLanguageModelAvailability | string | undefined
): AiAvailability {
  if (raw === "available" || raw === "readily" || raw === "readily-available") {
    return "available";
  }
  if (raw === "downloadable" || raw === "after-download") {
    return "downloadable";
  }
  if (raw === "downloading") return "downloading";
  return "unavailable";
}
