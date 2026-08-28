"use client";

import { AiDownloadProgress } from "@/components/ai-assistant/ai-download-progress";
import {
  getProviderStatusLabel,
  isProviderStatusOk,
} from "@/lib/ai/provider-status-label";
import type { AiAvailability, GenerateProgress } from "@/lib/ai/types";
import { Loader2 } from "lucide-react";

type Props = {
  availability: AiAvailability;
  checking: boolean;
  isReady?: boolean;
  preparing?: boolean;
  progress?: GenerateProgress | null;
  showTroubleshooting?: boolean;
};

export function ProviderStatus({
  availability,
  checking,
  isReady = false,
  preparing = false,
  progress = null,
  showTroubleshooting = true,
}: Props) {
  if (checking) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm text-muted">
        <Loader2 className="size-4 animate-spin" />
        Verificando compatibilidade…
      </div>
    );
  }

  const label = getProviderStatusLabel({
    availability,
    isReady,
    preparing,
    progress,
  });
  const isOk = isProviderStatusOk({ availability, isReady });
  const showDownloadBar =
    (preparing || progress?.phase === "downloading") &&
    progress?.downloadPercent !== undefined;

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        isOk
          ? "border-accent/30 bg-accent/5 text-text-secondary"
          : "border-border bg-surface/50 text-muted"
      }`}
    >
      <p>{label}</p>
      {showDownloadBar ? (
        <div className="mt-3">
          <AiDownloadProgress percent={progress!.downloadPercent!} />
        </div>
      ) : null}
      {progress?.phase === "generating" ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-muted">
          <Loader2 className="size-3 animate-spin" />
          Gerando currículo…
        </p>
      ) : null}
      {availability === "unavailable" && showTroubleshooting ? (
        <div className="mt-2 space-y-1 text-xs text-muted">
          <p>
            Use Chrome desktop 148+ com hardware compatível (~16 GB RAM, GPU com
            4+ GB VRAM). Você ainda pode preencher o formulário manualmente.
          </p>
          <p>
            <a
              href="https://developer.chrome.com/docs/ai/prompt-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              Documentação da Prompt API
            </a>
            {" · "}
            <a
              href="chrome://on-device-internals"
              className="text-accent underline-offset-2 hover:underline"
            >
              chrome://on-device-internals
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
