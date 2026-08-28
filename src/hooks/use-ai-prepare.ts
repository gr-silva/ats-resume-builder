"use client";

import { getChromeAiProvider } from "@/lib/ai/providers";
import type { GenerateProgress } from "@/lib/ai/types";
import { useCallback, useState } from "react";

export function useAiPrepare(onPrepared?: () => void) {
  const [preparing, setPreparing] = useState(false);
  const [progress, setProgress] = useState<GenerateProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePrepare = useCallback(async () => {
    const provider = getChromeAiProvider();
    if (!provider) {
      setError("IA do Chrome indisponível neste navegador.");
      return;
    }

    setPreparing(true);
    setError(null);
    setProgress(null);

    try {
      await provider.prepare(setProgress);
      onPrepared?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível preparar a IA."
      );
    } finally {
      setPreparing(false);
      setProgress(null);
    }
  }, [onPrepared]);

  return { preparing, progress, error, handlePrepare, clearError: () => setError(null) };
}
