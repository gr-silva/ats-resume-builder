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

/** First tab that is not fully done; falls back to dados. */
export function getFirstIncompleteTab(data: ResumeData): FormTabId {
  const { sections } = getFormProgress(data);
  return FORM_TAB_IDS.find((id) => sections[id] !== "done") ?? "dados";
}

export const FORM_TAB_LABELS: Record<FormTabId, string> = {
  dados: "Dados",
  resumo: "Resumo",
  skills: "Skills",
  experiencia: "Experiência",
  formacao: "Formação",
  extra: "Extra",
};

export const FORM_TAB_NEXT_HINTS: Record<FormTabId, string> = {
  dados: "Comece pelo nome e cargo-alvo. O preview atualiza ao lado.",
  resumo: "Escreva 3–4 linhas com stack, experiência e um resultado concreto.",
  skills: "Agrupe competências em categorias e adicione itens como tags.",
  experiencia:
    "Inclua cargo, empresa e bullets com contexto, ação e resultado.",
  formacao: "Informe curso/grau e instituição (o período é opcional).",
  extra: "Cursos, idiomas e disponibilidade reforçam o currículo.",
};
