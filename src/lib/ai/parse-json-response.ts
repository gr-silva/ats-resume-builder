import { parseAiResumeOutput } from "@/lib/ai/merge-resume";
import { AiParseError, type AiResumeOutput } from "@/lib/ai/types";

export function parseJsonResponse(text: string): AiResumeOutput {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : trimmed;
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "JSON inválido";
    throw new AiParseError(`Não foi possível interpretar a resposta: ${message}`);
  }
  const resume = parseAiResumeOutput(parsed);
  if (!resume) {
    throw new AiParseError(
      "Resposta não corresponde ao schema esperado do currículo."
    );
  }
  return resume;
}
