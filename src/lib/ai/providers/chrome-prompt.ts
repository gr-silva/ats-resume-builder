import {
  getLanguageModelApi,
  hasLanguageModelApi,
  normalizeAvailability,
  type LanguageModelSession,
} from "@/lib/ai/language-model-api";
import { parseAiResumeOutput } from "@/lib/ai/merge-resume";
import { parseStarJsonResponse } from "@/lib/ai/parse-star-response";
import { createMonotonicProgressReporter } from "@/lib/ai/progress";
import { buildRetryPrompt } from "@/lib/ai/prompts";
import { RESUME_JSON_SCHEMA } from "@/lib/ai/resume-json-schema";
import {
  AiParseError,
  AiUnavailableError,
  type AiAvailability,
  type AiProvider,
  type AiResumeOutput,
  type GenerateProgress,
} from "@/lib/ai/types";

async function promptOnce(
  session: LanguageModelSession,
  prompt: string,
  schema: Record<string, unknown>
): Promise<string> {
  if (!session.prompt) {
    throw new AiUnavailableError("Sessão da IA não suporta geração de texto.");
  }
  return session.prompt(prompt, {
    responseConstraint: schema,
  });
}

function createSessionWithProgress(
  onProgress?: (progress: GenerateProgress) => void,
  skipDownloadMonitor = false
) {
  const api = getLanguageModelApi();
  if (!api?.create) {
    throw new AiUnavailableError();
  }

  const reportDownload = createMonotonicProgressReporter(
    (downloadPercent) => onProgress?.({ phase: "downloading", downloadPercent }),
    { initial: 5, min: 5, max: 99 }
  );

  return api.create(
    skipDownloadMonitor
      ? undefined
      : {
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (event) => {
              const loaded = (event as ProgressEvent).loaded ?? 0;
              reportDownload(Math.round(loaded * 100));
            });
          },
        }
  );
}

class ChromePromptProviderImpl implements AiProvider {
  readonly id = "chrome-prompt" as const;
  private ready = false;

  isReady(): boolean {
    return this.ready;
  }

  resetReadyState(): void {
    this.ready = false;
  }

  async checkAvailability(): Promise<AiAvailability> {
    if (!hasLanguageModelApi()) return "unavailable";
    if (this.ready) return "available";
    try {
      const api = getLanguageModelApi();
      const raw = await api?.availability?.();
      return normalizeAvailability(raw);
    } catch {
      return "unavailable";
    }
  }

  async prepare(
    onProgress?: (progress: GenerateProgress) => void
  ): Promise<void> {
    if (!hasLanguageModelApi()) {
      throw new AiUnavailableError();
    }

    onProgress?.({ phase: "checking" });
    const api = getLanguageModelApi();
    const availability = normalizeAvailability(await api?.availability?.());
    if (availability === "unavailable") {
      throw new AiUnavailableError();
    }

    const session = await createSessionWithProgress(onProgress);
    try {
      session.destroy?.();
      this.ready = true;
      onProgress?.({ phase: "downloading", downloadPercent: 100 });
    } catch (error) {
      session.destroy?.();
      throw error;
    }
  }

  async generateJson<T>(
    prompt: string,
    schema: Record<string, unknown>,
    parse: (raw: unknown) => T | null,
    onProgress?: (progress: GenerateProgress) => void
  ): Promise<T> {
    if (!hasLanguageModelApi()) {
      throw new AiUnavailableError();
    }

    onProgress?.({ phase: "checking" });
    const api = getLanguageModelApi();
    const availability = normalizeAvailability(await api?.availability?.());
    if (availability === "unavailable") {
      throw new AiUnavailableError();
    }

    const session = await createSessionWithProgress(onProgress, this.ready);

    try {
      onProgress?.({ phase: "generating" });
      const response = await promptOnce(session, prompt, schema);
      try {
        const result = parseStarJsonResponse(response, parse);
        this.ready = true;
        return result;
      } catch (firstError) {
        if (firstError instanceof AiParseError) {
          const retryPrompt = buildRetryPrompt(
            prompt,
            response,
            firstError.message
          );
          const retryResponse = await promptOnce(session, retryPrompt, schema);
          const result = parseStarJsonResponse(retryResponse, parse);
          this.ready = true;
          return result;
        }
        throw firstError;
      }
    } finally {
      session.destroy?.();
    }
  }

  async generateResume(
    prompt: string,
    onProgress?: (progress: GenerateProgress) => void
  ): Promise<AiResumeOutput> {
    return this.generateJson(
      prompt,
      RESUME_JSON_SCHEMA as Record<string, unknown>,
      parseAiResumeOutput,
      onProgress
    );
  }
}

const chromePromptProviderImpl = new ChromePromptProviderImpl();

export const chromePromptProvider: AiProvider = chromePromptProviderImpl;

/** @internal Test helper */
export function resetChromePromptProviderForTests(): void {
  chromePromptProviderImpl.resetReadyState();
}
