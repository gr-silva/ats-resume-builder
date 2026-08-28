"use client";

import { AiConsentCheckbox } from "@/components/ai-assistant/ai-consent-checkbox";
import { AiPrepareButton } from "@/components/ai-assistant/ai-prepare-button";
import { ProviderStatus } from "@/components/ai-assistant/provider-status";
import { ResumePreview } from "@/components/ai-assistant/resume-preview";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useChromeAi } from "@/hooks/use-chrome-ai";
import { hasAiConsent } from "@/lib/ai/consent";
import { mergeAiIntoResume } from "@/lib/ai/merge-resume";
import { isImportTextValid, normalizeResumeText } from "@/lib/ai/parse-resume-text";
import { buildImportPrompt } from "@/lib/ai/prompts";
import { getChromeAiProvider } from "@/lib/ai/providers";
import type { AiResumeOutput, GenerateProgress } from "@/lib/ai/types";
import type { ResumeData } from "@/lib/resume/schema";
import { FileUp, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentData: ResumeData;
  onApply: (data: ResumeData) => void;
};

type ImportStep = "input" | "review";

export function ImportDialog({
  open,
  onOpenChange,
  currentData,
  onApply,
}: Props) {
  const { availability, checking, isSupported, isReady, refresh } = useChromeAi();
  const [consent, setConsent] = useState(() => hasAiConsent());
  const [step, setStep] = useState<ImportStep>("input");
  const [text, setText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerateProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AiResumeOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      await refresh();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [open, refresh]);

  const textValid = isImportTextValid(text);

  async function handleFileSelect(file: File) {
    const allowed = [".txt", ".md", "text/plain", "text/markdown"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (
      !allowed.includes(ext) &&
      !file.type.startsWith("text/")
    ) {
      setError("Use arquivos .txt ou .md, ou cole o texto do currículo.");
      return;
    }
    const content = await file.text();
    setText(normalizeResumeText(content));
    setError(null);
  }

  async function handleGenerate() {
    const provider = getChromeAiProvider();
    if (!provider) {
      setError("IA do Chrome indisponível neste navegador.");
      return;
    }
    if (!textValid) {
      setError("Cole pelo menos 80 caracteres de texto do currículo.");
      return;
    }

    setGenerating(true);
    setError(null);
    setProgress(null);

    try {
      const prompt = buildImportPrompt(normalizeResumeText(text));
      const result = await provider.generateResume(prompt, setProgress);
      setPreview(result);
      setStep("review");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao importar currículo com IA."
      );
    } finally {
      setGenerating(false);
      setProgress(null);
    }
  }

  function handleApply() {
    if (!preview) return;
    onApply(mergeAiIntoResume(currentData, preview));
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Importar currículo"
      description="Cole o texto do seu currículo e a IA preenche o formulário."
      className="max-w-xl"
    >
      <div className="space-y-4">
        <ProviderStatus
          availability={availability}
          checking={checking}
          isReady={isReady}
          progress={progress}
        />

        {step === "input" ? (
          <>
            <AiConsentCheckbox checked={consent} onChange={setConsent} />
            <div className="space-y-2">
              <Label htmlFor="import-text">Texto do currículo</Label>
              <Textarea
                id="import-text"
                className="min-h-[200px] font-mono text-xs"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Cole aqui o conteúdo do seu currículo (PDF, DOCX, LinkedIn…). Dica: abra o arquivo, selecione tudo e cole."
              />
              <p className="text-xs text-muted">
                Mínimo 80 caracteres. Para PDF/DOCX, copie o texto manualmente.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileSelect(file);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="size-4" /> Carregar .txt ou .md
              </Button>
            </div>
            {error ? <p className="text-sm text-accent">{error}</p> : null}
            <div className="flex flex-wrap justify-end gap-2">
              <AiPrepareButton onPrepared={() => void refresh()} />
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={!consent || !isSupported || !textValid || generating}
                onClick={() => void handleGenerate()}
              >
                <Sparkles className="size-4" />
                {generating ? "Analisando…" : "Analisar e preencher"}
              </Button>
            </div>
          </>
        ) : null}

        {step === "review" && preview ? (
          <>
            <ResumePreview preview={preview} />
            <p className="text-xs text-muted">
              Revise os dados extraídos antes de aplicar ao formulário.
            </p>
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("input")}
              >
                Voltar
              </Button>
              <Button type="button" onClick={handleApply}>
                Aplicar ao formulário
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </Dialog>
  );
}
