import { applyFocus } from "@/lib/focus";
import type { FocusId, ResumeData } from "@/lib/resume/schema";

export type ResumeBlock =
  | { type: "name"; text: string }
  | { type: "role"; text: string }
  | { type: "contact"; text: string }
  | { type: "section"; text: string }
  | { type: "jobTitle"; text: string }
  | { type: "jobMeta"; text: string }
  | { type: "educationTitle"; text: string }
  | { type: "educationMeta"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] };

function nonEmpty(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

/**
 * Convert ResumeData into typed blocks for the PDF renderer.
 */
export function buildBlocks(
  data: ResumeData,
  focus: FocusId = "geral"
): ResumeBlock[] {
  const d = applyFocus(data, focus);
  const blocks: ResumeBlock[] = [];

  if (nonEmpty(d.name)) blocks.push({ type: "name", text: d.name.trim() });
  if (nonEmpty(d.targetRole)) {
    blocks.push({ type: "role", text: d.targetRole.trim() });
  }

  const contact = [d.location, d.phone, d.email, d.linkedin, d.portfolio]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" | ");
  if (contact) blocks.push({ type: "contact", text: contact });

  if (nonEmpty(d.summary)) {
    blocks.push({ type: "section", text: "RESUMO PROFISSIONAL" });
    blocks.push({ type: "paragraph", text: d.summary.trim() });
  }

  const skillItems = d.skillCategories
    .filter((c) => nonEmpty(c.name) && nonEmpty(c.items))
    .map((c) => `${c.name.trim()}: ${c.items.trim()}`);

  if (skillItems.length) {
    blocks.push({ type: "section", text: "COMPETÊNCIAS TÉCNICAS" });
    blocks.push({ type: "bullets", items: skillItems });
  }

  const experiences = d.experiences.filter(
    (e) =>
      nonEmpty(e.title) ||
      nonEmpty(e.company) ||
      e.bullets.some((b) => nonEmpty(b))
  );

  if (experiences.length) {
    blocks.push({ type: "section", text: "EXPERIÊNCIA PROFISSIONAL" });
    for (const exp of experiences) {
      const header = [exp.title.trim(), exp.company.trim()]
        .filter(Boolean)
        .join(" | ");
      if (header) blocks.push({ type: "jobTitle", text: header });
      if (nonEmpty(exp.period)) {
        blocks.push({ type: "jobMeta", text: exp.period.trim() });
      }
      const bullets = exp.bullets.map((b) => b.trim()).filter(Boolean);
      if (bullets.length) blocks.push({ type: "bullets", items: bullets });
    }
  }

  const education = d.education.filter(
    (e) => nonEmpty(e.degree) || nonEmpty(e.institution)
  );
  if (education.length) {
    blocks.push({ type: "section", text: "FORMAÇÃO ACADÊMICA" });
    for (const edu of education) {
      if (nonEmpty(edu.degree)) {
        blocks.push({ type: "educationTitle", text: edu.degree.trim() });
      }
      const meta = [edu.institution.trim(), edu.period.trim()]
        .filter(Boolean)
        .join(" | ");
      if (meta) blocks.push({ type: "educationMeta", text: meta });
    }
  }

  const courses = d.courses.map((c) => c.text.trim()).filter(Boolean);
  if (courses.length) {
    blocks.push({ type: "section", text: "CERTIFICAÇÕES E CURSOS" });
    blocks.push({ type: "bullets", items: courses });
  }

  const languages = d.languages
    .filter((l) => nonEmpty(l.name) || nonEmpty(l.level))
    .map((l) => [l.name.trim(), l.level.trim()].filter(Boolean).join(": "));
  if (languages.length) {
    blocks.push({ type: "section", text: "IDIOMAS" });
    blocks.push({ type: "bullets", items: languages });
  }

  if (nonEmpty(d.availability)) {
    blocks.push({ type: "section", text: "DISPONIBILIDADE" });
    blocks.push({ type: "paragraph", text: d.availability.trim() });
  }

  return blocks;
}
