import { applyFocus } from "@/lib/focus";
import type { FocusId, ResumeData } from "@/lib/resume/schema";

function nonEmpty(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

/**
 * Build ATS-safe markdown from structured resume data.
 */
export function buildMarkdown(
  data: ResumeData,
  focus: FocusId = "geral"
): string {
  const d = applyFocus(data, focus);
  const lines: string[] = [];

  if (nonEmpty(d.name)) lines.push(`# ${d.name.trim()}`);
  if (nonEmpty(d.targetRole)) {
    lines.push("");
    lines.push(d.targetRole.trim());
  }

  const contactParts = [
    d.location,
    d.phone,
    d.email,
    d.linkedin,
    d.portfolio,
  ]
    .map((p) => p.trim())
    .filter(Boolean);

  if (contactParts.length) {
    lines.push("");
    lines.push(contactParts.join(" | "));
  }

  if (nonEmpty(d.summary)) {
    lines.push("");
    lines.push("## RESUMO PROFISSIONAL");
    lines.push("");
    lines.push(d.summary.trim());
  }

  const skillLines = d.skillCategories
    .filter((c) => nonEmpty(c.name) && nonEmpty(c.items))
    .map((c) => `- ${c.name.trim()}: ${c.items.trim()}`);

  if (skillLines.length) {
    lines.push("");
    lines.push("## COMPETÊNCIAS TÉCNICAS");
    lines.push("");
    lines.push(...skillLines);
  }

  const experiences = d.experiences.filter(
    (e) =>
      nonEmpty(e.title) ||
      nonEmpty(e.company) ||
      e.bullets.some((b) => nonEmpty(b))
  );

  if (experiences.length) {
    lines.push("");
    lines.push("## EXPERIÊNCIA PROFISSIONAL");

    for (const exp of experiences) {
      lines.push("");
      const header = [exp.title.trim(), exp.company.trim()]
        .filter(Boolean)
        .join(" | ");
      if (header) lines.push(`### ${header}`);
      if (nonEmpty(exp.period)) {
        lines.push("");
        lines.push(exp.period.trim());
      }
      const bullets = exp.bullets.map((b) => b.trim()).filter(Boolean);
      if (bullets.length) {
        lines.push("");
        for (const b of bullets) lines.push(`- ${b}`);
      }
    }
  }

  const education = d.education.filter(
    (e) => nonEmpty(e.degree) || nonEmpty(e.institution)
  );

  if (education.length) {
    lines.push("");
    lines.push("## FORMAÇÃO ACADÊMICA");
    for (const edu of education) {
      lines.push("");
      if (nonEmpty(edu.degree)) lines.push(`### ${edu.degree.trim()}`);
      const meta = [edu.institution.trim(), edu.period.trim()]
        .filter(Boolean)
        .join(" | ");
      if (meta) {
        lines.push("");
        lines.push(meta);
      }
    }
  }

  const courses = d.courses.map((c) => c.text.trim()).filter(Boolean);
  if (courses.length) {
    lines.push("");
    lines.push("## CERTIFICAÇÕES E CURSOS");
    lines.push("");
    for (const c of courses) lines.push(`- ${c}`);
  }

  const languages = d.languages.filter(
    (l) => nonEmpty(l.name) || nonEmpty(l.level)
  );
  if (languages.length) {
    lines.push("");
    lines.push("## IDIOMAS");
    lines.push("");
    for (const l of languages) {
      const text = [l.name.trim(), l.level.trim()].filter(Boolean).join(": ");
      lines.push(`- ${text}`);
    }
  }

  if (nonEmpty(d.availability)) {
    lines.push("");
    lines.push("## DISPONIBILIDADE");
    lines.push("");
    lines.push(d.availability.trim());
  }

  return `${lines.join("\n").trim()}\n`;
}
