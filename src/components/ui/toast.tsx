"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastMessage = {
  id: number;
  text: string;
  action?: ToastAction;
};

type ToastProps = {
  message: ToastMessage | null;
  onDismiss: () => void;
  durationMs?: number;
  className?: string;
};

export function Toast({
  message,
  onDismiss,
  durationMs = 3000,
  className,
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
        "fixed bottom-6 left-1/2 z-[60] flex max-w-[min(90vw,24rem)] -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-elevated px-4 py-3 text-sm text-foreground shadow-lg",
        className
      )}
    >
      <span className="flex-1">{message.text}</span>
      {message.action ? (
        <button
          type="button"
          className="shrink-0 font-medium text-accent underline-offset-2 hover:underline"
          onClick={() => {
            message.action?.onClick();
            onDismiss();
          }}
        >
          {message.action.label}
        </button>
      ) : null}
    </div>
  );
}
