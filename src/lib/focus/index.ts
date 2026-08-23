import type { FocusId, ResumeData } from "@/lib/resume/schema";
import { MVP_FOCUS } from "@/lib/resume/schema";

/**
 * Apply focus-specific transforms (reorder skills/bullets, rewrite via AI, etc.).
 * MVP: only "geral" — returns data unchanged (identity).
 * Future: fullstack / ia / custom niches + AI revision.
 */
export function applyFocus(data: ResumeData, focusId: FocusId): ResumeData {
  if (focusId !== MVP_FOCUS) {
    // Keep identity for now; callers should gate unsupported focuses in the UI/API.
    return { ...data, focus: focusId };
  }
  return { ...data, focus: "geral" };
}

export function isFocusSupported(focusId: FocusId): boolean {
  return focusId === MVP_FOCUS;
}

export const FOCUS_LABELS: Record<FocusId, string> = {
  geral: "Geral",
  fullstack: "Full Stack (em breve)",
  ia: "IA (em breve)",
};
