/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  TOUR_STORAGE_KEY,
  hasCompletedTour,
  markTourCompleted,
} from "@/lib/tour/storage";

describe("tour storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts incomplete", () => {
    expect(hasCompletedTour()).toBe(false);
  });

  it("persists completion on the product key", () => {
    markTourCompleted();
    expect(localStorage.getItem(TOUR_STORAGE_KEY)).toBe("1");
    expect(hasCompletedTour()).toBe(true);
  });
});
