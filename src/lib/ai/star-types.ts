export type StarComponent = "situation" | "task" | "action" | "result";

export type StarComponentStatus = "clear" | "partial" | "missing";

export type StarComponentAnalysis = {
  text: string;
  status: StarComponentStatus;
};

export type StarQuestion = {
  component: StarComponent;
  question: string;
  hint?: string;
};

export type StarSuggestion = {
  issue: string;
  idea: string;
};

export type StarBulletAnalysis = {
  bulletIndex: number;
  original: string;
  situation: StarComponentAnalysis;
  task: StarComponentAnalysis;
  action: StarComponentAnalysis;
  result: StarComponentAnalysis;
  suggestions: StarSuggestion[];
  questions: StarQuestion[];
};

export type StarExperienceAnalysis = {
  bullets: StarBulletAnalysis[];
};

export type StarRewriteItem = {
  bulletIndex: number;
  original: string;
  rewritten: string;
  breakdown: Record<StarComponent, string>;
};

export type StarExperienceContext = {
  title: string;
  company: string;
  period: string;
};

export type StarUserAnswer = {
  bulletIndex: number;
  component: StarComponent;
  answer: string;
  skipped?: boolean;
};

export const STAR_COMPONENT_LABELS: Record<StarComponent, string> = {
  situation: "Situação",
  task: "Tarefa",
  action: "Ação",
  result: "Resultado",
};
