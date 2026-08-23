import { z } from "zod";

export const FocusIdSchema = z.enum(["geral", "fullstack", "ia"]);
export type FocusId = z.infer<typeof FocusIdSchema>;

/** Only "geral" is supported in MVP. */
export const MVP_FOCUS: FocusId = "geral";

export const SkillCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.string(),
});

export const ExperienceSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  period: z.string(),
  bullets: z.array(z.string()),
});

export const EducationSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  period: z.string(),
});

export const CourseSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const LanguageSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.string(),
});

export const ResumeDataSchema = z.object({
  name: z.string(),
  targetRole: z.string(),
  location: z.string(),
  phone: z.string(),
  email: z.string(),
  linkedin: z.string(),
  portfolio: z.string(),
  summary: z.string(),
  skillCategories: z.array(SkillCategorySchema),
  experiences: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  courses: z.array(CourseSchema),
  languages: z.array(LanguageSchema),
  availability: z.string(),
  focus: FocusIdSchema.default("geral"),
});

export type ResumeData = z.infer<typeof ResumeDataSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Language = z.infer<typeof LanguageSchema>;

export function createEmptyResume(): ResumeData {
  return {
    name: "",
    targetRole: "",
    location: "",
    phone: "",
    email: "",
    linkedin: "",
    portfolio: "",
    summary: "",
    skillCategories: [
      { id: cryptoRandomId(), name: "Linguagens", items: "" },
      { id: cryptoRandomId(), name: "Front-end", items: "" },
      { id: cryptoRandomId(), name: "Back-end e Cloud", items: "" },
    ],
    experiences: [
      {
        id: cryptoRandomId(),
        title: "",
        company: "",
        period: "",
        bullets: [""],
      },
    ],
    education: [
      {
        id: cryptoRandomId(),
        degree: "",
        institution: "",
        period: "",
      },
    ],
    courses: [],
    languages: [
      { id: cryptoRandomId(), name: "Português", level: "Nativo" },
      { id: cryptoRandomId(), name: "Inglês", level: "" },
    ],
    availability: "",
    focus: "geral",
  };
}

export function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
