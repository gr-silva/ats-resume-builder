const STAR_COMPONENT_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    text: { type: "string" },
    status: { type: "string", enum: ["clear", "partial", "missing"] },
  },
  required: ["text", "status"],
};

const STAR_QUESTION_SCHEMA = {
  type: "object",
  properties: {
    component: {
      type: "string",
      enum: ["situation", "task", "action", "result"],
    },
    question: { type: "string" },
    hint: { type: "string" },
  },
  required: ["component", "question"],
};

const STAR_BULLET_ANALYSIS_ITEM_SCHEMA = {
  type: "object",
  properties: {
    bulletIndex: { type: "number" },
    original: { type: "string" },
    situation: STAR_COMPONENT_ANALYSIS_SCHEMA,
    task: STAR_COMPONENT_ANALYSIS_SCHEMA,
    action: STAR_COMPONENT_ANALYSIS_SCHEMA,
    result: STAR_COMPONENT_ANALYSIS_SCHEMA,
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          issue: { type: "string" },
          idea: { type: "string" },
        },
        required: ["issue", "idea"],
      },
    },
    questions: {
      type: "array",
      items: STAR_QUESTION_SCHEMA,
    },
  },
  required: [
    "bulletIndex",
    "original",
    "situation",
    "task",
    "action",
    "result",
    "suggestions",
    "questions",
  ],
};

/** JSON Schema for single bullet STAR analysis. */
export const STAR_BULLET_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    bullets: {
      type: "array",
      items: STAR_BULLET_ANALYSIS_ITEM_SCHEMA,
      minItems: 1,
      maxItems: 1,
    },
  },
  required: ["bullets"],
};

/** JSON Schema for experience-wide STAR analysis. */
export const STAR_EXPERIENCE_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    bullets: {
      type: "array",
      items: STAR_BULLET_ANALYSIS_ITEM_SCHEMA,
    },
  },
  required: ["bullets"],
};

const STAR_REWRITE_ITEM_SCHEMA = {
  type: "object",
  properties: {
    bulletIndex: { type: "number" },
    original: { type: "string" },
    rewritten: { type: "string" },
    breakdown: {
      type: "object",
      properties: {
        situation: { type: "string" },
        task: { type: "string" },
        action: { type: "string" },
        result: { type: "string" },
      },
      required: ["situation", "task", "action", "result"],
    },
  },
  required: ["bulletIndex", "original", "rewritten", "breakdown"],
};

/** JSON Schema for STAR rewrite output (single or multiple bullets). */
export const STAR_REWRITE_SCHEMA = {
  type: "object",
  properties: {
    rewrites: {
      type: "array",
      items: STAR_REWRITE_ITEM_SCHEMA,
    },
  },
  required: ["rewrites"],
};
