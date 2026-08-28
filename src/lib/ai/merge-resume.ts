import type { AiResumeOutput } from "@/lib/ai/types";
import { cryptoRandomId, type ResumeData } from "@/lib/resume/schema";

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function mapSkillCategories(
  items: AiResumeOutput["skillCategories"]
): ResumeData["skillCategories"] {
  const filtered = items
    .map((c) => ({ name: str(c.name), items: str(c.items) }))
    .filter((c) => c.name || c.items);
  if (!filtered.length) {
    return [{ id: cryptoRandomId(), name: "Linguagens", items: "" }];
  }
  return filtered.map((c) => ({ ...c, id: cryptoRandomId() }));
}

function mapExperiences(
  items: AiResumeOutput["experiences"]
): ResumeData["experiences"] {
  const filtered = items
    .map((e) => ({
      title: str(e.title),
      company: str(e.company),
      period: str(e.period),
      bullets: (e.bullets ?? []).map((b) => str(b)).filter(Boolean),
    }))
    .filter((e) => e.title || e.company || e.bullets.length);
  if (!filtered.length) {
    return [
      {
        id: cryptoRandomId(),
        title: "",
        company: "",
        period: "",
        bullets: [""],
      },
    ];
  }
  return filtered.map((e) => ({
    ...e,
    id: cryptoRandomId(),
    bullets: e.bullets.length ? e.bullets : [""],
  }));
}

function mapEducation(
  items: AiResumeOutput["education"]
): ResumeData["education"] {
  const filtered = items
    .map((e) => ({
      degree: str(e.degree),
      institution: str(e.institution),
      period: str(e.period),
    }))
    .filter((e) => e.degree || e.institution);
  if (!filtered.length) {
    return [
      {
        id: cryptoRandomId(),
        degree: "",
        institution: "",
        period: "",
      },
    ];
  }
  return filtered.map((e) => ({ ...e, id: cryptoRandomId() }));
}

function mapCourses(items: AiResumeOutput["courses"]): ResumeData["courses"] {
  return items
    .map((c) => ({ text: str(c.text) }))
    .filter((c) => c.text)
    .map((c) => ({ ...c, id: cryptoRandomId() }));
}

function mapLanguages(
  items: AiResumeOutput["languages"]
): ResumeData["languages"] {
  const filtered = items
    .map((l) => ({ name: str(l.name), level: str(l.level) }))
    .filter((l) => l.name);
  if (!filtered.length) {
    return [
      { id: cryptoRandomId(), name: "Português", level: "Nativo" },
      { id: cryptoRandomId(), name: "Inglês", level: "" },
    ];
  }
  return filtered.map((l) => ({ ...l, id: cryptoRandomId() }));
}

export function parseAiResumeOutput(raw: unknown): AiResumeOutput | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    name: str(o.name),
    targetRole: str(o.targetRole),
    location: str(o.location),
    phone: str(o.phone),
    email: str(o.email),
    linkedin: str(o.linkedin),
    portfolio: str(o.portfolio),
    summary: str(o.summary),
    skillCategories: Array.isArray(o.skillCategories)
      ? (o.skillCategories as AiResumeOutput["skillCategories"])
      : [],
    experiences: Array.isArray(o.experiences)
      ? (o.experiences as AiResumeOutput["experiences"])
      : [],
    education: Array.isArray(o.education)
      ? (o.education as AiResumeOutput["education"])
      : [],
    courses: Array.isArray(o.courses)
      ? (o.courses as AiResumeOutput["courses"])
      : [],
    languages: Array.isArray(o.languages)
      ? (o.languages as AiResumeOutput["languages"])
      : [],
    availability: str(o.availability),
  };
}

export function mergeAiIntoResume(
  current: ResumeData,
  ai: AiResumeOutput
): ResumeData {
  return {
    name: str(ai.name) || current.name,
    targetRole: str(ai.targetRole) || current.targetRole,
    location: str(ai.location) || current.location,
    phone: str(ai.phone) || current.phone,
    email: str(ai.email) || current.email,
    linkedin: str(ai.linkedin) || current.linkedin,
    portfolio: str(ai.portfolio) || current.portfolio,
    summary: str(ai.summary) || current.summary,
    skillCategories: mapSkillCategories(ai.skillCategories),
    experiences: mapExperiences(ai.experiences),
    education: mapEducation(ai.education),
    courses: mapCourses(ai.courses),
    languages: mapLanguages(ai.languages),
    availability: str(ai.availability) || current.availability,
    focus: "geral",
  };
}
