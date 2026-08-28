"use client";

import type { AiAvailability, GenerateProgress } from "@/lib/ai/types";
import { Loader2 } from "lucide-react";

type Props = {
  availability: AiAvailability;
  checking: boolean;
  progress?: GenerateProgress | null;
};

const AVAILABILITY_LABELS: Record<AiAvailability, string> = {
  available: "IA do Chrome pronta",
  downloadable: "Modelo disponível para download",
  downloading: "Baixando modelo…",
  unavailable: "IA do Chrome indisponível",
};

export function ProviderStatus({ availability, checking, progress }: Props) {
  if (checking) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm text-muted">
        <Loader2 className="size-4 animate-spin" />
        Verificando compatibilidade…
      </div>
    );
  }

  const label = AVAILABILITY_LABELS[availability];
  const isOk = availability === "available" || availability === "downloadable";

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        isOk
          ? "border-accent/30 bg-accent/5 text-text-secondary"
          : "border-border bg-surface/50 text-muted"
      }`}
    >
      <p>{label}</p>
      {progress?.phase === "downloading" &&
      progress.downloadPercent !== undefined ? (
        <p className="mt-1 text-xs text-muted">
          Download do modelo: {progress.downloadPercent}%
        </p>
      ) : null}
      {progress?.phase === "generating" ? (
        <p className="mt-1 flex items-center gap-2 text-xs text-muted">
          <Loader2 className="size-3 animate-spin" />
          Gerando currículo…
        </p>
      ) : null}
      {availability === "unavailable" ? (
        <p className="mt-2 text-xs text-muted">
          Use Chrome desktop 148+ com hardware compatível (~16 GB RAM, GPU com 4+
          GB VRAM). Você ainda pode preencher o formulário manualmente.
        </p>
      ) : null}
    </div>
  );
}
