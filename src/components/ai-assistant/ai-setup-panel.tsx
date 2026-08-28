"use client";

import { ProviderStatus } from "@/components/ai-assistant/provider-status";
import { Button } from "@/components/ui/button";
import { useAiPrepare } from "@/hooks/use-ai-prepare";
import { useChromeAi } from "@/hooks/use-chrome-ai";
import { Download, Loader2 } from "lucide-react";

export function AiSetupPanel() {
  const { availability, checking, isSupported, isReady, refresh } = useChromeAi();
  const { preparing, progress, error, handlePrepare } = useAiPrepare(() => {
    void refresh();
  });

  const needsDownload =
    isSupported && !isReady && availability === "downloadable";

  return (
    <div className="rounded-xl border border-border bg-elevated/80 p-4">
      <h3 className="mb-3 text-sm font-medium">IA do Chrome</h3>
      <ProviderStatus
        availability={availability}
        checking={checking}
        isReady={isReady}
        progress={progress}
      />
      {error ? <p className="mt-2 text-xs text-accent">{error}</p> : null}
      {needsDownload ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          disabled={preparing || checking}
          onClick={() => void handlePrepare()}
        >
          {preparing ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Preparando…
            </>
          ) : (
            <>
              <Download className="size-4" /> Preparar IA
            </>
          )}
        </Button>
      ) : null}
      <p className="mt-3 text-xs text-muted">
        O assistente roda localmente (Gemini Nano). Nada é enviado a servidores
        externos.
      </p>
    </div>
  );
}
