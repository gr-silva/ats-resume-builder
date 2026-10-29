export const TOUR_STORAGE_KEY = "ats-resume-builder:tour:v1";

export function hasCompletedTour(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markTourCompleted(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, "1");
  } catch {
    /* private mode / quota */
  }
}
