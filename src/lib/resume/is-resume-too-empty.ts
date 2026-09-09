import type { ResumeData } from "@/lib/resume/schema";

function nonEmpty(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

function hasMeaningfulExperience(data: ResumeData): boolean {
  return data.experiences.some(
    (e) =>
      nonEmpty(e.title) ||
      nonEmpty(e.company) ||
      e.bullets.some((b) => nonEmpty(b))
  );
}

/**
 * True when export would produce a near-empty ATS resume
 * (missing name or any real experience content).
 */
export function isResumeTooEmpty(data: ResumeData): boolean {
  return !nonEmpty(data.name) || !hasMeaningfulExperience(data);
}
