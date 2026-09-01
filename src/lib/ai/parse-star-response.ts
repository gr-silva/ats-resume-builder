import { AiParseError } from "@/lib/ai/types";
import type {
  StarBulletAnalysis,
  StarComponent,
  StarComponentAnalysis,
  StarComponentStatus,
  StarExperienceAnalysis,
  StarQuestion,
  StarRewriteItem,
} from "@/lib/ai/star-types";

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function parseStatus(value: unknown): StarComponentStatus {
  if (value === "clear" || value === "partial" || value === "missing") {
    return value;
  }
  return "missing";
}

function parseComponent(value: unknown): StarComponent | null {
  if (
    value === "situation" ||
    value === "task" ||
    value === "action" ||
    value === "result"
  ) {
    return value;
  }
  return null;
}

function parseComponentAnalysis(raw: unknown): StarComponentAnalysis {
  if (!raw || typeof raw !== "object") {
    return { text: "", status: "missing" };
  }
  const o = raw as Record<string, unknown>;
  return {
    text: str(o.text),
    status: parseStatus(o.status),
  };
}

function parseQuestion(raw: unknown): StarQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const component = parseComponent(o.component);
  const question = str(o.question);
  if (!component || !question) return null;
  const hint = str(o.hint);
  return hint ? { component, question, hint } : { component, question };
}

export function parseStarBulletAnalysisItem(
  raw: unknown
): StarBulletAnalysis | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.bulletIndex !== "number") return null;

  const original = str(o.original);
  const questions = Array.isArray(o.questions)
    ? o.questions
        .map(parseQuestion)
        .filter((q): q is StarQuestion => q !== null)
    : [];
  const suggestions = Array.isArray(o.suggestions)
    ? o.suggestions.map((s) => str(s)).filter(Boolean)
    : [];

  return {
    bulletIndex: o.bulletIndex,
    original,
    situation: parseComponentAnalysis(o.situation),
    task: parseComponentAnalysis(o.task),
    action: parseComponentAnalysis(o.action),
    result: parseComponentAnalysis(o.result),
    suggestions,
    questions,
  };
}

function parseBulletsArray(raw: unknown): StarBulletAnalysis[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(parseStarBulletAnalysisItem)
    .filter((b): b is StarBulletAnalysis => b !== null);
}

export function parseStarExperienceAnalysis(
  raw: unknown
): StarExperienceAnalysis | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const bullets = parseBulletsArray(o.bullets);
  if (!bullets.length) return null;
  return { bullets };
}

export function parseStarBulletAnalysis(raw: unknown): StarBulletAnalysis | null {
  const parsed = parseStarExperienceAnalysis(raw);
  return parsed?.bullets[0] ?? null;
}

function parseBreakdown(
  raw: unknown
): Record<StarComponent, string> | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    situation: str(o.situation),
    task: str(o.task),
    action: str(o.action),
    result: str(o.result),
  };
}

function parseRewriteItem(raw: unknown): StarRewriteItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.bulletIndex !== "number") return null;
  const rewritten = str(o.rewritten);
  const breakdown = parseBreakdown(o.breakdown);
  if (!rewritten || !breakdown) return null;
  return {
    bulletIndex: o.bulletIndex,
    original: str(o.original),
    rewritten,
    breakdown,
  };
}

export function parseStarRewrite(raw: unknown): StarRewriteItem[] | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.rewrites)) return null;
  const rewrites = o.rewrites
    .map(parseRewriteItem)
    .filter((r): r is StarRewriteItem => r !== null);
  if (!rewrites.length) return null;
  return rewrites;
}

export function parseStarJsonResponse<T>(
  text: string,
  parse: (raw: unknown) => T | null
): T {
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
  const result = parse(parsed);
  if (!result) {
    throw new AiParseError("Resposta não corresponde ao schema esperado STAR.");
  }
  return result;
}
