import { describe, expect, it } from "vitest";
import {
  getProviderStatusLabel,
  needsModelPrepare,
} from "@/lib/ai/provider-status-label";

describe("getProviderStatusLabel", () => {
  it("does not show downloading for passive Chrome downloading status", () => {
    expect(
      getProviderStatusLabel({
        availability: "downloading",
        progress: null,
      })
    ).toBe("Modelo disponível para download");
  });

  it("shows downloading when app has active download progress", () => {
    expect(
      getProviderStatusLabel({
        availability: "downloadable",
        progress: { phase: "downloading", downloadPercent: 42 },
      })
    ).toBe("Baixando modelo…");
  });

  it("shows downloading when preparing without percent yet", () => {
    expect(
      getProviderStatusLabel({
        availability: "downloadable",
        preparing: true,
        progress: { phase: "checking" },
      })
    ).toBe("Baixando modelo…");
  });

  it("shows ready when isReady even if availability is downloading", () => {
    expect(
      getProviderStatusLabel({
        availability: "downloading",
        isReady: true,
      })
    ).toBe("IA do Chrome pronta");
  });

  it("shows generating during generate phase", () => {
    expect(
      getProviderStatusLabel({
        availability: "available",
        isReady: true,
        progress: { phase: "generating" },
      })
    ).toBe("Gerando currículo…");
  });
});

describe("needsModelPrepare", () => {
  it("treats passive downloading like downloadable for prepare CTA", () => {
    expect(
      needsModelPrepare({
        availability: "downloading",
        isReady: false,
        isSupported: true,
      })
    ).toBe(true);
  });

  it("hides prepare when already ready", () => {
    expect(
      needsModelPrepare({
        availability: "downloadable",
        isReady: true,
        isSupported: true,
      })
    ).toBe(false);
  });
});
