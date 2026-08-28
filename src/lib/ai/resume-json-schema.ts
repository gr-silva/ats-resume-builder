/** JSON Schema for Chrome Prompt API responseConstraint (ResumeData without ids). */
export const RESUME_JSON_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    targetRole: { type: "string" },
    location: { type: "string" },
    phone: { type: "string" },
    email: { type: "string" },
    linkedin: { type: "string" },
    portfolio: { type: "string" },
    summary: { type: "string" },
    skillCategories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          items: { type: "string" },
        },
        required: ["name", "items"],
      },
    },
    experiences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          period: { type: "string" },
          bullets: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["title", "company", "period", "bullets"],
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          degree: { type: "string" },
          institution: { type: "string" },
          period: { type: "string" },
        },
        required: ["degree", "institution", "period"],
      },
    },
    courses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
        },
        required: ["text"],
      },
    },
    languages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          level: { type: "string" },
        },
        required: ["name", "level"],
      },
    },
    availability: { type: "string" },
  },
  required: [
    "name",
    "targetRole",
    "location",
    "phone",
    "email",
    "linkedin",
    "portfolio",
    "summary",
    "skillCategories",
    "experiences",
    "education",
    "courses",
    "languages",
    "availability",
  ],
} as const;
