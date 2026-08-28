import { parseAiResumeOutput } from "@/lib/ai/merge-resume";
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

function hasLanguageModel(): boolean {
  return typeof LanguageModel !== "undefined";
}

function parseJsonResponse(text: string): AiResumeOutput {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : trimmed;
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new AiParseError();
  }
  const resume = parseAiResumeOutput(parsed);
  if (!resume) {
    throw new AiParseError();
  }
  return resume;
}

async function promptOnce(
  session: LanguageModel,
  prompt: string
): Promise<string> {
  return session.prompt(prompt, {
    responseConstraint: RESUME_JSON_SCHEMA as Record<string, unknown>,
  });
}

export const chromePromptProvider: AiProvider = {
  id: "chrome-prompt",

  async checkAvailability(): Promise<AiAvailability> {
    if (!hasLanguageModel()) return "unavailable";
    try {
      return await LanguageModel.availability();
    } catch {
      return "unavailable";
    }
  },

  async generateResume(
    prompt: string,
    onProgress?: (progress: GenerateProgress) => void
  ): Promise<AiResumeOutput> {
    if (!hasLanguageModel()) {
      throw new AiUnavailableError();
    }

    onProgress?.({ phase: "checking" });
    const availability = await LanguageModel.availability();
    if (availability === "unavailable") {
      throw new AiUnavailableError();
    }

    let downloadPercent: number | undefined;
    const session = await LanguageModel.create({
      monitor(monitor) {
        monitor.addEventListener("downloadprogress", (event) => {
          downloadPercent = Math.round(event.loaded * 100);
          onProgress?.({
            phase: "downloading",
            downloadPercent,
          });
        });
      },
    });

    try {
      onProgress?.({ phase: "generating", downloadPercent });
      const response = await promptOnce(session, prompt);
      try {
        return parseJsonResponse(response);
      } catch (firstError) {
        if (firstError instanceof AiParseError) {
          const retryPrompt = buildRetryPrompt(prompt, response);
          const retryResponse = await promptOnce(session, retryPrompt);
          return parseJsonResponse(retryResponse);
        }
        throw firstError;
      }
    } finally {
      session.destroy();
    }
  },
};
