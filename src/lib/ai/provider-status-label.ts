import type { AiAvailability, GenerateProgress } from "@/lib/ai/types";

export type ProviderStatusLabelInput = {
  availability: AiAvailability;
  isReady?: boolean;
  preparing?: boolean;
  progress?: GenerateProgress | null;
};

/**
 * Derive the user-facing status label.
 * Never show "Baixando modelo…" from passive Chrome `downloading` alone —
 * only when this app started prepare/generate and has active progress.
 */
export function getProviderStatusLabel({
  availability,
  isReady = false,
  preparing = false,
  progress = null,
}: ProviderStatusLabelInput): string {
  if (progress?.phase === "generating") {
    return "Gerando currículo…";
  }

  if (
    preparing ||
    progress?.phase === "downloading" ||
    progress?.phase === "checking"
  ) {
    return "Baixando modelo…";
  }

  if (isReady || availability === "available") {
    return "IA do Chrome pronta";
  }

  if (availability === "downloadable" || availability === "downloading") {
    return "Modelo disponível para download";
  }

  return "IA do Chrome indisponível";
}

export function isProviderStatusOk({
  availability,
  isReady = false,
}: Pick<ProviderStatusLabelInput, "availability" | "isReady">): boolean {
  return (
    isReady ||
    availability === "available" ||
    availability === "downloadable" ||
    availability === "downloading"
  );
}

/** Show prepare CTA when model needs download (including passive downloading). */
export function needsModelPrepare({
  availability,
  isReady = false,
  isSupported,
}: {
  availability: AiAvailability;
  isReady?: boolean;
  isSupported: boolean;
}): boolean {
  return (
    isSupported &&
    !isReady &&
    (availability === "downloadable" || availability === "downloading")
  );
}
