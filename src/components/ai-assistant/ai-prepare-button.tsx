"use client";

import { Button } from "@/components/ui/button";
import { useAiPrepare } from "@/hooks/use-ai-prepare";
import { useChromeAi } from "@/hooks/use-chrome-ai";
import { Download, Loader2 } from "lucide-react";

type Props = {
  onPrepared?: () => void;
};

export function AiPrepareButton({ onPrepared }: Props) {
  const { availability, isReady, refresh } = useChromeAi();
  const { preparing, handlePrepare } = useAiPrepare(() => {
    void refresh();
    onPrepared?.();
  });

  if (isReady || availability !== "downloadable") return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={preparing}
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
  );
}
