"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

export type ToastMessage = {
  id: number;
  text: string;
};

type ToastProps = {
  message: ToastMessage | null;
  onDismiss: () => void;
  durationMs?: number;
};

export function Toast({
  message,
  onDismiss,
  durationMs = 3000,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss, durationMs]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-1/2 z-[60] max-w-[min(90vw,24rem)] -translate-x-1/2 rounded-lg border border-border bg-elevated px-4 py-3 text-sm text-foreground shadow-lg"
      )}
    >
      {message.text}
    </div>
  );
}
