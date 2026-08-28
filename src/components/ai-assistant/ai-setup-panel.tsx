"use client";

import { ProviderStatus } from "@/components/ai-assistant/provider-status";
import { useChromeAiContext } from "@/components/ai-assistant/chrome-ai-provider";
import { Button } from "@/components/ui/button";
import { needsModelPrepare } from "@/lib/ai/provider-status-label";
import { Download, Loader2 } from "lucide-react";

export function AiSetupPanel() {
  const {
    availability,
    checking,
    isSupported,
    isReady,
    preparing,
    progress,
    prepareError,
    handlePrepare,
  } = useChromeAiContext();

  const needsDownload = needsModelPrepare({
    availability,
    isReady,
    isSupported,
  });

  return (
    <div className="rounded-xl border border-border bg-elevated/80 p-4">
      <h3 className="mb-3 text-sm font-medium">IA do Chrome</h3>
      <ProviderStatus
        availability={availability}
        checking={checking}
        isReady={isReady}
        preparing={preparing}
        progress={progress}
      />
      {prepareError ? (
        <p className="mt-2 text-xs text-accent">{prepareError}</p>
      ) : null}
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
