import { describe, expect, it } from "vitest";
import { normalizeAvailability } from "@/lib/ai/language-model-api";

describe("normalizeAvailability", () => {
  it("maps readily variants to available", () => {
    expect(normalizeAvailability("readily")).toBe("available");
    expect(normalizeAvailability("readily-available")).toBe("available");
    expect(normalizeAvailability("available")).toBe("available");
  });

  it("maps download states", () => {
    expect(normalizeAvailability("downloadable")).toBe("downloadable");
    expect(normalizeAvailability("after-download")).toBe("downloadable");
    expect(normalizeAvailability("downloading")).toBe("downloading");
  });

  it("defaults unknown values to unavailable", () => {
    expect(normalizeAvailability("no")).toBe("unavailable");
    expect(normalizeAvailability(undefined)).toBe("unavailable");
  });
});
