import type { ResumeData } from "@/lib/resume/schema";

function nonEmpty(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

export type LinkedInExperienceCopy = {
  id: string;
  heading: string;
  period: string;
  bullets: string[];
  /** Full block ready to paste into a LinkedIn experience description. */
  body: string;
};

export type LinkedInCopy = {
  /** About / summary text for the LinkedIn profile. */
  about: string;
  experiences: LinkedInExperienceCopy[];
};

/**
 * Build deterministic Portuguese LinkedIn-ready texts from a local draft.
 * No AI — only formats fields the user already filled.
 */
export function buildLinkedInCopy(data: ResumeData): LinkedInCopy {
  const aboutParts: string[] = [];
  if (nonEmpty(data.targetRole)) {
    aboutParts.push(data.targetRole.trim());
  }
  if (nonEmpty(data.summary)) {
    aboutParts.push(data.summary.trim());
  }
  const about = aboutParts.join("\n\n");

  const experiences: LinkedInExperienceCopy[] = data.experiences
    .filter(
      (e) =>
        nonEmpty(e.title) ||
        nonEmpty(e.company) ||
        e.bullets.some((b) => nonEmpty(b))
    )
    .map((exp) => {
      const title = exp.title.trim();
      const company = exp.company.trim();
      let heading = "";
      if (title && company) heading = `${title} @ ${company}`;
      else heading = title || company;

      const period = exp.period.trim();
      const bullets = exp.bullets.map((b) => b.trim()).filter(Boolean);

      const bodyLines: string[] = [];
      if (period) bodyLines.push(period);
      if (bullets.length) {
        if (bodyLines.length) bodyLines.push("");
        for (const b of bullets) bodyLines.push(`• ${b}`);
      }

      return {
        id: exp.id,
        heading,
        period,
        bullets,
        body: bodyLines.join("\n"),
      };
    });

  return { about, experiences };
}

/** Flatten LinkedIn copy into a single .txt download payload. */
export function linkedInCopyToPlainText(copy: LinkedInCopy): string {
  const lines: string[] = [];

  if (copy.about) {
    lines.push("SOBRE");
    lines.push("");
    lines.push(copy.about);
  }

  if (copy.experiences.length) {
    if (lines.length) {
      lines.push("");
      lines.push("---");
      lines.push("");
    }
    lines.push("EXPERIÊNCIA");
    for (const exp of copy.experiences) {
      lines.push("");
      if (exp.heading) lines.push(exp.heading);
      if (exp.body) {
        if (exp.heading) lines.push("");
        lines.push(exp.body);
      }
    }
  }

  return lines.length ? `${lines.join("\n").trim()}\n` : "";
}
