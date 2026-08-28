"use client";

import { useChromeAiContext } from "@/components/ai-assistant/chrome-ai-provider";
import { Button } from "@/components/ui/button";
import { needsModelPrepare } from "@/lib/ai/provider-status-label";
import { Download, Loader2 } from "lucide-react";

type Props = {
  onPrepared?: () => void;
};

export function AiPrepareButton({ onPrepared }: Props) {
  const {
    availability,
    isReady,
    isSupported,
    preparing,
    handlePrepare,
  } = useChromeAiContext();

  if (!needsModelPrepare({ availability, isReady, isSupported })) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={preparing}
      onClick={() => {
        void (async () => {
          await handlePrepare();
          onPrepared?.();
        })();
      }}
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
  );
}
