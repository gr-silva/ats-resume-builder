"use client";

import { getChromeAiProvider } from "@/lib/ai/providers";
import type {
  AiAvailability,
  AiResumeOutput,
  GenerateProgress,
} from "@/lib/ai/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AiActiveOperation = null | "prepare" | "generate";

type ChromeAiContextValue = {
  availability: AiAvailability;
  checking: boolean;
  isSupported: boolean;
  isReady: boolean;
  refreshing: boolean;
  preparing: boolean;
  progress: GenerateProgress | null;
  prepareError: string | null;
  activeOperation: AiActiveOperation;
  refresh: () => Promise<void>;
  handlePrepare: () => Promise<void>;
  generateResume: (prompt: string) => Promise<AiResumeOutput>;
  generateJson: <T>(
    prompt: string,
    schema: Record<string, unknown>,
    parse: (raw: unknown) => T | null
  ) => Promise<T>;
  clearPrepareError: () => void;
};

const ChromeAiContext = createContext<ChromeAiContextValue | null>(null);

export function ChromeAiProvider({ children }: { children: ReactNode }) {
  const [availability, setAvailability] =
    useState<AiAvailability>("unavailable");
  const [checking, setChecking] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [progress, setProgress] = useState<GenerateProgress | null>(null);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [activeOperation, setActiveOperation] =
    useState<AiActiveOperation>(null);

  const refresh = useCallback(async () => {
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

  const handlePrepare = useCallback(async () => {
    const provider = getChromeAiProvider();
    if (!provider) {
      setPrepareError("IA do Chrome indisponível neste navegador.");
      return;
    }

    setPreparing(true);
    setActiveOperation("prepare");
    setPrepareError(null);
    setProgress(null);

    try {
      await provider.prepare(setProgress);
      await refresh();
    } catch (err) {
      setPrepareError(
        err instanceof Error ? err.message : "Não foi possível preparar a IA."
      );
    } finally {
      setPreparing(false);
      setActiveOperation(null);
      setProgress(null);
    }
  }, [refresh]);

  const generateResume = useCallback(
    async (prompt: string): Promise<AiResumeOutput> => {
      const provider = getChromeAiProvider();
      if (!provider) {
        throw new Error("IA do Chrome indisponível neste navegador.");
      }

      setActiveOperation("generate");
      setProgress(null);

      try {
        const result = await provider.generateResume(prompt, setProgress);
        await refresh();
        return result;
      } finally {
        setActiveOperation(null);
        setProgress(null);
      }
    },
    [refresh]
  );

  const generateJson = useCallback(
    async <T,>(
      prompt: string,
      schema: Record<string, unknown>,
      parse: (raw: unknown) => T | null
    ): Promise<T> => {
      const provider = getChromeAiProvider();
      if (!provider) {
        throw new Error("IA do Chrome indisponível neste navegador.");
      }

      setActiveOperation("generate");
      setProgress(null);

      try {
        const result = await provider.generateJson(
          prompt,
          schema,
          parse,
          setProgress
        );
        await refresh();
        return result;
      } finally {
        setActiveOperation(null);
        setProgress(null);
      }
    },
    [refresh]
  );

  const isSupported = availability !== "unavailable";

  const value = useMemo<ChromeAiContextValue>(
    () => ({
      availability,
      checking,
      isSupported,
      isReady,
      refreshing: checking,
      preparing,
      progress,
      prepareError,
      activeOperation,
      refresh,
      handlePrepare,
      generateResume,
      generateJson,
      clearPrepareError: () => setPrepareError(null),
    }),
    [
      availability,
      checking,
      isSupported,
      isReady,
      preparing,
      progress,
      prepareError,
      activeOperation,
      refresh,
      handlePrepare,
      generateResume,
      generateJson,
    ]
  );

  return (
    <ChromeAiContext.Provider value={value}>{children}</ChromeAiContext.Provider>
  );
}

export function useChromeAiContext(): ChromeAiContextValue {
  const ctx = useContext(ChromeAiContext);
  if (!ctx) {
    throw new Error("useChromeAiContext must be used within ChromeAiProvider");
  }
  return ctx;
}
