"use client";

import { getChromeAiProvider } from "@/lib/ai/providers";
import type { AiAvailability } from "@/lib/ai/types";
import { useCallback, useEffect, useState } from "react";

export function useChromeAi() {
  const [availability, setAvailability] = useState<AiAvailability>("unavailable");
  const [checking, setChecking] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const syncFromProvider = useCallback(async () => {
    const provider = getChromeAiProvider();
    if (!provider) {
      setAvailability("unavailable");
      setIsReady(false);
      setChecking(false);
      return;
    }
    setChecking(true);
    try {
      const status = await provider.checkAvailability();
      setAvailability(status);
      setIsReady(provider.isReady());
    } catch {
      setAvailability("unavailable");
      setIsReady(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const provider = getChromeAiProvider();
      if (!provider) {
        if (!cancelled) {
          setAvailability("unavailable");
          setIsReady(false);
          setChecking(false);
        }
        return;
      }
      try {
        const status = await provider.checkAvailability();
        if (!cancelled) {
          setAvailability(status);
          setIsReady(provider.isReady());
        }
      } catch {
        if (!cancelled) {
          setAvailability("unavailable");
          setIsReady(false);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isSupported = availability !== "unavailable";

  return {
    availability,
    checking,
    isSupported,
    isReady,
    refresh: syncFromProvider,
  };
}
