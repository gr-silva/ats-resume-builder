"use client";

import { ProviderStatus } from "@/components/ai-assistant/provider-status";
import { useChromeAiContext } from "@/components/ai-assistant/chrome-ai-provider";
import { Button } from "@/components/ui/button";
import { needsModelPrepare } from "@/lib/ai/provider-status-label";
import { Download, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Open by default on `lg+`; collapsed on smaller screens so IA does not read
 * as a prerequisite after a long form. User toggle wins over the media query.
 */
function useAiPanelOpen() {
  const [open, setOpen] = useState(false);
  const userTouched = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (!userTouched.current) setOpen(mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return {
    open,
    onToggle: (next: boolean) => {
      userTouched.current = true;
      setOpen(next);
    },
  };
}

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
  const { open, onToggle } = useAiPanelOpen();

  const needsDownload = needsModelPrepare({
    availability,
    isReady,
    isSupported,
  });

  return (
    <details
      id="ai-setup"
      open={open}
      onToggle={(e) => onToggle(e.currentTarget.open)}
      className="rounded-xl border border-border/80 bg-elevated/50 p-4"
    >
      <summary className="cursor-pointer list-none text-sm text-muted marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="font-medium text-text-secondary">IA opcional</span>
        <span className="mt-0.5 block text-xs font-normal text-muted">
          Não é necessária para preencher ou baixar MD/PDF
        </span>
      </summary>
      <div className="mt-3">
        {!isSupported && !checking ? (
          <div className="space-y-2 text-sm text-muted">
            <p>
              O formulário e o download já funcionam neste navegador. O
              assistente local é um extra no Chrome desktop.
            </p>
            <p className="text-xs">
              Requisitos: Chrome 148+ com hardware compatível (~16 GB RAM, GPU
              com 4+ GB VRAM).
            </p>
          </div>
        ) : (
          <>
            <ProviderStatus
              availability={availability}
              checking={checking}
              isReady={isReady}
              preparing={preparing}
              progress={progress}
            />
            {prepareError ? (
              <p className="mt-2 text-xs text-destructive">{prepareError}</p>
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
              O assistente roda localmente (Gemini Nano). Nada é enviado a
              servidores externos.
            </p>
          </>
        )}
      </div>
    </details>
  );
}
