export const AI_CONSENT_KEY = "ats-resume-builder:ai-consent:v1";

export function hasAiConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AI_CONSENT_KEY) === "1";
}

export function setAiConsent(accepted: boolean): void {
  if (typeof window === "undefined") return;
  if (accepted) {
    localStorage.setItem(AI_CONSENT_KEY, "1");
  } else {
    localStorage.removeItem(AI_CONSENT_KEY);
  }
}
