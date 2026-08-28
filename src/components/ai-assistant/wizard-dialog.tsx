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
import { buildWizardPrompt } from "@/lib/ai/prompts";
import { getChromeAiProvider } from "@/lib/ai/providers";
import type { AiResumeOutput, GenerateProgress, WizardAnswers } from "@/lib/ai/types";
import type { ResumeData } from "@/lib/resume/schema";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentData: ResumeData;
  onApply: (data: ResumeData) => void;
};

const EMPTY_ANSWERS: WizardAnswers = {
  nameAndRole: "",
  locationAndContacts: "",
  careerSummary: "",
  lastExperience: "",
  educationAndSkills: "",
};

const STEPS = [
  {
    key: "nameAndRole" as const,
    label: "Nome e cargo-alvo",
    placeholder: "Ex.: Maria Silva — Desenvolvedora Full Stack",
    hint: "Como você quer aparecer no currículo e qual vaga busca.",
  },
  {
    key: "locationAndContacts" as const,
    label: "Localização e contatos",
    placeholder:
      "São Paulo, SP\nemail@exemplo.com\nlinkedin.com/in/seu-perfil\n+55 (11) 90000-0000",
    hint: "Cidade, email, LinkedIn, telefone e portfólio (opcionais).",
  },
  {
    key: "careerSummary" as const,
    label: "Resumo da carreira",
    placeholder:
      "Ex.: 5 anos em desenvolvimento web, foco em React e Node.js. Já liderei migrações e automações com impacto mensurável.",
    hint: "2–3 frases sobre sua trajetória e pontos fortes.",
  },
  {
    key: "lastExperience" as const,
    label: "Experiência e conquistas",
    placeholder:
      "Empresa X — Software Engineer (2022–presente)\n- Reduzi tempo de deploy em 30% com CI/CD\n- Liderei migração de monólito para microsserviços",
    hint: "Último(s) emprego(s) com resultados concretos (números ajudam).",
  },
  {
    key: "educationAndSkills" as const,
    label: "Formação e skills",
    placeholder:
      "Ciência da Computação — USP (2016–2020)\nTypeScript, React, Node.js, AWS, Docker",
    hint: "Formação principal e tecnologias que domina.",
  },
];

type WizardStep = "intro" | "questions" | "review";

export function WizardDialog({
  open,
  onOpenChange,
  currentData,
  onApply,
}: Props) {
  const { availability, checking, isSupported, isReady, refresh } = useChromeAi();
  const [consent, setConsent] = useState(() => hasAiConsent());
  const [step, setStep] = useState<WizardStep>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>(EMPTY_ANSWERS);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerateProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AiResumeOutput | null>(null);

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

  const currentQuestion = STEPS[questionIndex];
  const canProceedQuestion = answers[currentQuestion.key].trim().length > 0;

  async function handleGenerate() {
    const provider = getChromeAiProvider();
    if (!provider) {
      setError("IA do Chrome indisponível neste navegador.");
      return;
    }

    setGenerating(true);
    setError(null);
    setProgress(null);

    try {
      const prompt = buildWizardPrompt(answers);
      const result = await provider.generateResume(prompt, setProgress);
      setPreview(result);
      setStep("review");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao gerar currículo com IA."
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
      title="Assistente IA"
      description="Responda algumas perguntas e preencha o formulário automaticamente."
      className="max-w-xl"
    >
      <div className="space-y-4">
        <ProviderStatus
          availability={availability}
          checking={checking}
          isReady={isReady}
          progress={progress}
        />

        {step === "intro" ? (
          <>
            <AiConsentCheckbox checked={consent} onChange={setConsent} />
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
                disabled={!consent || !isSupported || checking}
                onClick={() => setStep("questions")}
              >
                Começar <ChevronRight className="size-4" />
              </Button>
            </div>
          </>
        ) : null}

        {step === "questions" ? (
          <>
            <p className="text-xs text-muted">
              Pergunta {questionIndex + 1} de {STEPS.length}
            </p>
            <div className="space-y-2">
              <Label>{currentQuestion.label}</Label>
              <Textarea
                className="min-h-[140px]"
                value={answers[currentQuestion.key]}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.key]: e.target.value,
                  }))
                }
                placeholder={currentQuestion.placeholder}
              />
              <p className="text-xs text-muted">{currentQuestion.hint}</p>
            </div>
            {error ? <p className="text-sm text-accent">{error}</p> : null}
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (questionIndex === 0) {
                    setStep("intro");
                  } else {
                    setQuestionIndex((i) => i - 1);
                  }
                }}
              >
                <ChevronLeft className="size-4" /> Voltar
              </Button>
              {questionIndex < STEPS.length - 1 ? (
                <Button
                  type="button"
                  disabled={!canProceedQuestion}
                  onClick={() => setQuestionIndex((i) => i + 1)}
                >
                  Próxima <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={!canProceedQuestion || generating}
                  onClick={() => void handleGenerate()}
                >
                  <Sparkles className="size-4" />
                  {generating ? "Gerando…" : "Gerar currículo"}
                </Button>
              )}
            </div>
          </>
        ) : null}

        {step === "review" && preview ? (
          <>
            <ResumePreview preview={preview} />
            <p className="text-xs text-muted">
              Revise os dados antes de aplicar. Você pode editar tudo depois no
              formulário.
            </p>
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("questions")}
              >
                <ChevronLeft className="size-4" /> Editar respostas
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
