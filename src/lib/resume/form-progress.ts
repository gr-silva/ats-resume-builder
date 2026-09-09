import type { ResumeData } from "@/lib/resume/schema";

export const FORM_TAB_IDS = [
  "dados",
  "resumo",
  "skills",
  "experiencia",
  "formacao",
  "extra",
] as const;

export type FormTabId = (typeof FORM_TAB_IDS)[number];

export type SectionStatus = "done" | "partial" | "empty";

export type FormProgress = {
  sections: Record<FormTabId, SectionStatus>;
  doneCount: number;
  total: number;
};

function nonEmpty(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

function dadosStatus(data: ResumeData): SectionStatus {
  if (nonEmpty(data.name)) return "done";
  const anyOther = [
    data.targetRole,
    data.location,
    data.phone,
    data.email,
    data.linkedin,
    data.portfolio,
  ].some(nonEmpty);
  return anyOther ? "partial" : "empty";
}

function skillsStatus(data: ResumeData): SectionStatus {
  const withItems = data.skillCategories.some((c) => nonEmpty(c.items));
  if (withItems) return "done";
  return "empty";
}

function experienceStatus(data: ResumeData): SectionStatus {
  const hasContent = data.experiences.some(
    (e) =>
      nonEmpty(e.title) ||
      nonEmpty(e.company) ||
      e.bullets.some((b) => nonEmpty(b))
  );
  return hasContent ? "done" : "empty";
}

function formacaoStatus(data: ResumeData): SectionStatus {
  const hasContent = data.education.some(
    (e) => nonEmpty(e.degree) || nonEmpty(e.institution)
  );
  return hasContent ? "done" : "empty";
}

/** Default PT native alone does not count as done (empty template). */
function extraStatus(data: ResumeData): SectionStatus {
  if (data.courses.some((c) => nonEmpty(c.text)) || nonEmpty(data.availability)) {
    return "done";
  }

  const meaningfulLang = data.languages.some((l) => {
    if (!nonEmpty(l.name) || !nonEmpty(l.level)) return false;
    const isDefaultPt =
      l.name.trim() === "Português" && l.level.trim() === "Nativo";
    return !isDefaultPt;
  });
  if (meaningfulLang) return "done";

  const anyLangHint = data.languages.some(
    (l) => nonEmpty(l.name) || nonEmpty(l.level)
  );
  return anyLangHint ? "partial" : "empty";
}

export function getFormProgress(data: ResumeData): FormProgress {
  const sections: Record<FormTabId, SectionStatus> = {
    dados: dadosStatus(data),
    resumo: nonEmpty(data.summary) ? "done" : "empty",
    skills: skillsStatus(data),
    experiencia: experienceStatus(data),
    formacao: formacaoStatus(data),
    extra: extraStatus(data),
  };

  const doneCount = FORM_TAB_IDS.filter((id) => sections[id] === "done").length;

  return {
    sections,
    doneCount,
    total: FORM_TAB_IDS.length,
  };
}

export const FORM_TAB_LABELS: Record<FormTabId, string> = {
  dados: "Dados",
  resumo: "Resumo",
  skills: "Skills",
  experiencia: "Experiência",
  formacao: "Formação",
  extra: "Extra",
};
