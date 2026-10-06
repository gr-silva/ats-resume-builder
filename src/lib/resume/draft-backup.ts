import {
  ResumeDataSchema,
  type ResumeData,
} from "@/lib/resume/schema";

export function serializeDraft(data: ResumeData): string {
  return JSON.stringify({ ...data, focus: "geral" }, null, 2);
}

export type ParseDraftResult =
  | { ok: true; data: ResumeData }
  | { ok: false; error: string };

export function parseDraftBackup(raw: string): ParseDraftResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Arquivo JSON inválido." };
  }

  const result = ResumeDataSchema.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      error: "O arquivo não corresponde a um rascunho Passou válido.",
    };
  }

  return { ok: true, data: { ...result.data, focus: "geral" } };
}

export function draftBackupFilename(data: ResumeData): string {
  const base = (data.name || "rascunho").trim() || "rascunho";
  const safe = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return `${safe || "rascunho"}-passou-rascunho.json`;
}
