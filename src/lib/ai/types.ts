export type AiAvailability = "unavailable" | "downloadable" | "downloading" | "available";

export type AiResumeOutput = {
  name: string;
  targetRole: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  skillCategories: Array<{ name: string; items: string }>;
  experiences: Array<{
    title: string;
    company: string;
    period: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    period: string;
  }>;
  courses: Array<{ text: string }>;
  languages: Array<{ name: string; level: string }>;
  availability: string;
};

export type WizardAnswers = {
  nameAndRole: string;
  locationAndContacts: string;
  careerSummary: string;
  lastExperience: string;
  educationAndSkills: string;
};

export type GenerateProgress = {
  phase: "checking" | "downloading" | "generating";
  downloadPercent?: number;
};

export class AiUnavailableError extends Error {
  constructor(message = "IA do Chrome indisponível neste dispositivo ou navegador.") {
    super(message);
    this.name = "AiUnavailableError";
  }
}

export class AiParseError extends Error {
  constructor(message = "Não foi possível interpretar a resposta da IA.") {
    super(message);
    this.name = "AiParseError";
  }
}

export interface AiProvider {
  readonly id: "chrome-prompt";
  checkAvailability(): Promise<AiAvailability>;
  generateResume(
    prompt: string,
    onProgress?: (progress: GenerateProgress) => void
  ): Promise<AiResumeOutput>;
}
