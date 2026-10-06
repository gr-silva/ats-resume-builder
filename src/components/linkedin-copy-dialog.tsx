"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  buildLinkedInCopy,
  linkedInCopyToPlainText,
} from "@/lib/resume/build-linkedin-copy";
import type { ResumeData } from "@/lib/resume/schema";
import { Check, ClipboardCopy, Download } from "lucide-react";
import { useMemo, useState } from "react";

type LinkedInCopyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ResumeData;
  onCopied?: (label: string) => void;
};

async function copyText(text: string): Promise<boolean> {
  if (!text.trim()) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function CopyBlock({
  label,
  text,
  onCopied,
}: {
  label: string;
  text: string;
  onCopied?: (label: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const empty = !text.trim();

  async function handleCopy() {
    const ok = await copyText(text);
    if (!ok) return;
    setCopied(true);
    onCopied?.(label);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{label}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={empty}
          onClick={() => void handleCopy()}
        >
          {copied ? (
            <Check className="size-4" />
          ) : (
            <ClipboardCopy className="size-4" />
          )}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-secondary">
        {empty ? "Nada preenchido nesta seção." : text}
      </pre>
    </div>
  );
}

export function LinkedInCopyDialog({
  open,
  onOpenChange,
  data,
  onCopied,
}: LinkedInCopyDialogProps) {
  const copy = useMemo(() => buildLinkedInCopy(data), [data]);
  const plainText = useMemo(() => linkedInCopyToPlainText(copy), [copy]);
  const hasContent = Boolean(plainText.trim());

  function downloadTxt() {
    if (!hasContent) return;
    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.name || "curriculo").trim() || "curriculo"}-LinkedIn.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onCopied?.("Arquivo .txt");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Textos LinkedIn"
      description="Textos prontos a partir do rascunho local. Copie e cole no LinkedIn — nada é enviado a servidor."
      className="max-w-xl"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!hasContent}
            onClick={downloadTxt}
          >
            <Download className="size-4" /> Baixar .txt
          </Button>
        </div>

        <CopyBlock label="Sobre" text={copy.about} onCopied={onCopied} />

        {copy.experiences.length === 0 ? (
          <CopyBlock label="Experiência" text="" onCopied={onCopied} />
        ) : (
          copy.experiences.map((exp, index) => (
            <CopyBlock
              key={exp.id}
              label={
                exp.heading
                  ? `Experiência ${index + 1}: ${exp.heading}`
                  : `Experiência ${index + 1}`
              }
              text={[exp.heading, exp.body].filter(Boolean).join("\n\n")}
              onCopied={onCopied}
            />
          ))
        )}
      </div>
    </Dialog>
  );
}
