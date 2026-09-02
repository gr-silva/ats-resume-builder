"use client";

import { AiConsentCheckbox } from "@/components/ai-assistant/ai-consent-checkbox";
import { AiPrepareButton } from "@/components/ai-assistant/ai-prepare-button";
import { useChromeAiContext } from "@/components/ai-assistant/chrome-ai-provider";
import { ProviderStatus } from "@/components/ai-assistant/provider-status";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hasAiConsent } from "@/lib/ai/consent";
import {
  buildStarAnalyzeBulletPrompt,
  buildStarAnalyzeExperiencePrompt,
  buildStarRewritePrompt,
} from "@/lib/ai/prompts";
import {
  parseStarExperienceAnalysis,
  parseStarRewrite,
} from "@/lib/ai/parse-star-response";
import {
  STAR_BULLET_ANALYSIS_SCHEMA,
  STAR_EXPERIENCE_ANALYSIS_SCHEMA,
  STAR_REWRITE_SCHEMA,
} from "@/lib/ai/star-json-schema";
import {
  STAR_COMPONENT_LABELS,
  type StarBulletAnalysis,
  type StarExperienceContext,
  type StarQuestion,
  type StarRewriteItem,
  type StarSelectedSuggestion,
  type StarSuggestion,
  type StarUserAnswer,
} from "@/lib/ai/star-types";
import type { Experience } from "@/lib/resume/schema";
import { AlignLeft, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "bullet" | "experience";
  experience: Experience;
  bulletIndex?: number;
  onApply: (updatedExperience: Experience) => void;
};

type StarStep = "intro" | "analyzing" | "questions" | "rewriting" | "review";

type QuestionEntry = {
  bulletIndex: number;
  question: StarQuestion;
};

type SuggestionSelection = {
  selected: boolean;
  value: string;
};

function answerKey(bulletIndex: number, component: string): string {
  return `${bulletIndex}:${component}`;
}

function suggestionKey(bulletIndex: number, suggestionIndex: number): string {
  return `${bulletIndex}:${suggestionIndex}`;
}

function getExperienceContext(experience: Experience): StarExperienceContext {
  return {
    title: experience.title,
    company: experience.company,
    period: experience.period,
  };
}

function collectQuestions(analyses: StarBulletAnalysis[]): QuestionEntry[] {
  const entries: QuestionEntry[] = [];
  for (const analysis of analyses) {
    for (const question of analysis.questions) {
      entries.push({ bulletIndex: analysis.bulletIndex, question });
    }
  }
  return entries;
}

function collectSelectedSuggestions(
  analyses: StarBulletAnalysis[],
  selections: Record<string, SuggestionSelection>
): StarSelectedSuggestion[] {
  const selected: StarSelectedSuggestion[] = [];
  for (const analysis of analyses) {
    analysis.suggestions.forEach((suggestion, i) => {
      const key = suggestionKey(analysis.bulletIndex, i);
      const state = selections[key];
      if (!state?.selected) return;
      selected.push({
        bulletIndex: analysis.bulletIndex,
        issue: suggestion.issue,
        idea: suggestion.idea,
        value: state.value.trim(),
      });
    });
  }
  return selected;
}

/** Bullets in focus for a questions-step rewrite. */
function getFocusedBulletIndices(
  mode: "bullet" | "experience",
  bulletIndex: number | undefined,
  analyses: StarBulletAnalysis[],
  selections: Record<string, SuggestionSelection>
): number[] {
  if (mode === "bullet" && bulletIndex !== undefined) {
    return [bulletIndex];
  }

  const indices = new Set<number>();
  for (const analysis of analyses) {
    if (analysis.questions.length > 0) {
      indices.add(analysis.bulletIndex);
    }
  }
  for (const analysis of analyses) {
    analysis.suggestions.forEach((_, i) => {
      const key = suggestionKey(analysis.bulletIndex, i);
      if (selections[key]?.selected) {
        indices.add(analysis.bulletIndex);
      }
    });
  }
  return [...indices].sort((a, b) => a - b);
}

function StarBreakdown({
  breakdown,
}: {
  breakdown: StarRewriteItem["breakdown"];
}) {
  return (
    <dl className="grid gap-2 text-xs">
      {(Object.keys(STAR_COMPONENT_LABELS) as Array<keyof typeof STAR_COMPONENT_LABELS>).map(
        (key) => (
          <div key={key} className="rounded-md border border-border bg-surface/50 p-2">
            <dt className="font-medium text-text-secondary">
              {STAR_COMPONENT_LABELS[key]}
            </dt>
            <dd className="mt-1 text-muted">{breakdown[key] || "—"}</dd>
          </div>
        )
      )}
    </dl>
  );
}

function StarSuggestionsList({
  suggestions,
  bulletIndex,
  selections,
  onChange,
  interactive,
}: {
  suggestions: StarSuggestion[];
  bulletIndex: number;
  selections: Record<string, SuggestionSelection>;
  onChange?: (key: string, next: SuggestionSelection) => void;
  interactive: boolean;
}) {
  if (!suggestions.length) return null;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-foreground">
          Sugestões da análise
        </p>
        {interactive ? (
          <p className="mt-0.5 text-xs text-muted">
            Marque as ideias que devem entrar na reescrita. O valor é opcional —
            sem ele, a IA incorpora a ideia sem inventar métricas.
          </p>
        ) : null}
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion, i) => {
          const key = suggestionKey(bulletIndex, i);
          const state = selections[key] ?? { selected: false, value: "" };
          return (
            <div
              key={key}
              className="space-y-2 rounded-lg border border-accent/35 bg-accent/5 px-3 py-3"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {suggestion.issue}
              </p>
              {suggestion.idea ? (
                <p className="text-sm leading-relaxed text-foreground">
                  {suggestion.idea}
                </p>
              ) : null}
              {interactive && onChange ? (
                <>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--accent,#EF4444)]"
                      checked={state.selected}
                      onChange={(e) =>
                        onChange(key, {
                          ...state,
                          selected: e.target.checked,
                        })
                      }
                    />
                    Incluir na reescrita
                  </label>
                  {state.selected ? (
                    <div className="space-y-1.5">
                      <Label htmlFor={`suggestion-value-${key}`}>
                        Valor ou detalhe (opcional)
                      </Label>
                      <Textarea
                        id={`suggestion-value-${key}`}
                        className="min-h-[72px]"
                        value={state.value}
                        onChange={(e) =>
                          onChange(key, {
                            ...state,
                            value: e.target.value,
                          })
                        }
                        placeholder={
                          suggestion.idea
                            ? `Ex.: complete com seu dado — ${suggestion.idea.slice(0, 80)}${suggestion.idea.length > 80 ? "…" : ""}`
                            : "Ex.: 3 rotinas de onboarding"
                        }
                      />
                      <p className="text-xs text-muted">
                        Se deixar em branco, a IA usa a ideia acima sem inventar
                        números.
                      </p>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getBulletOriginalText(
  analyses: StarBulletAnalysis[],
  experience: Experience,
  bulletIndex: number
): string {
  const fromAnalysis = analyses.find((a) => a.bulletIndex === bulletIndex)?.original;
  return (fromAnalysis || experience.bullets[bulletIndex] || "").trim();
}

export function StarReviewDialog({
  open,
  onOpenChange,
  mode,
  experience,
  bulletIndex,
  onApply,
}: Props) {
  const {
    availability,
    checking,
    isSupported,
    isReady,
    preparing,
    progress,
    refresh,
    generateJson,
  } = useChromeAiContext();

  const [consent, setConsent] = useState(() => hasAiConsent());
  const [step, setStep] = useState<StarStep>("intro");
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<StarBulletAnalysis[]>([]);
  const [rewrites, setRewrites] = useState<StarRewriteItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const [expandedBullets, setExpandedBullets] = useState<Record<number, boolean>>({});
  const [selectedSuggestions, setSelectedSuggestions] = useState<
    Record<string, SuggestionSelection>
  >({});

  const context = useMemo(() => getExperienceContext(experience), [experience]);

  const questionEntries = useMemo(
    () => collectQuestions(analyses),
    [analyses]
  );

  const bulletGroups = useMemo(() => {
    const indices = new Set<number>();
    for (const entry of questionEntries) {
      indices.add(entry.bulletIndex);
    }
    for (const analysis of analyses) {
      if (analysis.suggestions.length) {
        indices.add(analysis.bulletIndex);
      }
    }
    return [...indices]
      .sort((a, b) => a - b)
      .map((bi) => ({
        bulletIndex: bi,
        questions: questionEntries.filter((e) => e.bulletIndex === bi),
        analysis: analyses.find((a) => a.bulletIndex === bi) ?? null,
      }));
  }, [analyses, questionEntries]);

  const resetState = useCallback(() => {
    setStep("intro");
    setError(null);
    setAnalyses([]);
    setRewrites([]);
    setAnswers({});
    setSkipped({});
    setExpandedBullets({});
    setSelectedSuggestions({});
  }, []);

  function handleOpenChange(next: boolean) {
    if (!next) resetState();
    onOpenChange(next);
  }

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

  const targetBullets = useMemo(() => {
    if (mode === "bullet" && bulletIndex !== undefined) {
      return [{ index: bulletIndex, text: experience.bullets[bulletIndex] ?? "" }];
    }
    return experience.bullets
      .map((text, index) => ({ index, text }))
      .filter((b) => b.text.trim());
  }, [mode, bulletIndex, experience.bullets]);

  async function runRewrite(
    currentAnalyses: StarBulletAnalysis[],
    currentAnswers: Record<string, string>,
    currentSkipped: Record<string, boolean>,
    currentSelections: Record<string, SuggestionSelection>,
    options?: { skipFocusFilter?: boolean }
  ) {
    setStep("rewriting");
    setError(null);

    const focusedIndices = options?.skipFocusFilter
      ? currentAnalyses.map((a) => a.bulletIndex)
      : getFocusedBulletIndices(
          mode,
          bulletIndex,
          currentAnalyses,
          currentSelections
        );

    if (!focusedIndices.length) {
      setError(
        "Marque uma sugestão ou responda uma pergunta para reescrever."
      );
      setStep("questions");
      return;
    }

    const focusedAnalyses = currentAnalyses.filter((a) =>
      focusedIndices.includes(a.bulletIndex)
    );

    const items = focusedAnalyses.map((a) => ({
      bulletIndex: a.bulletIndex,
      original: a.original || experience.bullets[a.bulletIndex] || "",
    }));

    const userAnswers: StarUserAnswer[] = collectQuestions(focusedAnalyses)
      .map(({ bulletIndex: bi, question }) => {
        const key = answerKey(bi, question.component);
        return {
          bulletIndex: bi,
          component: question.component,
          answer: currentAnswers[key] ?? "",
          skipped: currentSkipped[key] ?? false,
        };
      })
      .filter((a) => a.answer.trim() || a.skipped);

    const selected = collectSelectedSuggestions(
      focusedAnalyses,
      currentSelections
    );

    try {
      const prompt = buildStarRewritePrompt(
        context,
        items,
        userAnswers,
        selected
      );
      const result = await generateJson(
        prompt,
        STAR_REWRITE_SCHEMA as Record<string, unknown>,
        parseStarRewrite
      );
      setRewrites(result);
      setStep("review");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao reescrever bullet(s) STAR."
      );
      setStep(collectQuestions(currentAnalyses).length ? "questions" : "intro");
    }
  }

  async function handleStartAnalyze() {
    setStep("analyzing");
    setError(null);

    if (!targetBullets.length) {
      setError("Nenhum bullet com texto para analisar.");
      setStep("intro");
      return;
    }

    try {
      let nextAnalyses: StarBulletAnalysis[];

      if (mode === "bullet" && bulletIndex !== undefined) {
        const bullet = experience.bullets[bulletIndex] ?? "";
        const result = await generateJson(
          buildStarAnalyzeBulletPrompt(context, bullet, bulletIndex),
          STAR_BULLET_ANALYSIS_SCHEMA as Record<string, unknown>,
          parseStarExperienceAnalysis
        );
        nextAnalyses = result.bullets;
      } else {
        const result = await generateJson(
          buildStarAnalyzeExperiencePrompt(context, experience.bullets),
          STAR_EXPERIENCE_ANALYSIS_SCHEMA as Record<string, unknown>,
          parseStarExperienceAnalysis
        );
        nextAnalyses = result.bullets;
      }

      setAnalyses(nextAnalyses);
      const qs = collectQuestions(nextAnalyses);
      const hasSuggestions = nextAnalyses.some((a) => a.suggestions.length);
      if (qs.length || hasSuggestions) {
        setStep("questions");
      } else {
        await runRewrite(nextAnalyses, answers, skipped, {}, {
          skipFocusFilter: true,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao analisar bullet(s) STAR."
      );
      setStep("intro");
    }
  }

  async function handleSubmitAnswers() {
    await runRewrite(analyses, answers, skipped, selectedSuggestions);
  }

  function handleApply() {
    const updated = { ...experience, bullets: [...experience.bullets] };
    for (const rewrite of rewrites) {
      if (
        rewrite.bulletIndex >= 0 &&
        rewrite.bulletIndex < updated.bullets.length &&
        rewrite.rewritten.trim()
      ) {
        updated.bullets[rewrite.bulletIndex] = rewrite.rewritten.trim();
      }
    }
    onApply(updated);
    handleOpenChange(false);
  }

  function updateSuggestionSelection(key: string, next: SuggestionSelection) {
    setSelectedSuggestions((prev) => ({ ...prev, [key]: next }));
  }

  const title =
    mode === "bullet"
      ? "Revisar STAR — bullet"
      : "Revisar STAR — experiência";

  const description =
    mode === "bullet"
      ? "Analise e reescreva este bullet no formato STAR comprimido."
      : "Analise e reescreva os bullets em foco desta experiência.";

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      className="max-w-xl"
    >
      <div className="space-y-4">
        <ProviderStatus
          availability={availability}
          checking={checking}
          isReady={isReady}
          preparing={preparing}
          progress={progress}
        />

        {step === "intro" ? (
          <>
            <AiConsentCheckbox checked={consent} onChange={setConsent} />
            <p className="text-xs text-muted">
              A IA identifica Situação, Tarefa, Ação e Resultado. Se faltar
              informação, fará perguntas antes de reescrever. Nada é aplicado ao
              formulário até você confirmar no preview.
            </p>
            {error ? <p className="text-sm text-accent">{error}</p> : null}
            <div className="flex flex-wrap justify-end gap-2">
              <AiPrepareButton onPrepared={() => void refresh()} />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={!consent || !isSupported || checking}
                onClick={() => void handleStartAnalyze()}
              >
                Analisar <ChevronRight className="size-4" />
              </Button>
            </div>
          </>
        ) : null}

        {step === "analyzing" || step === "rewriting" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-sm text-muted">
            <Sparkles className="size-6 animate-pulse text-accent" />
            {step === "analyzing"
              ? "Analisando componentes STAR…"
              : "Reescrevendo bullets em foco…"}
          </div>
        ) : null}

        {step === "questions" ? (
          <>
            <p className="text-xs text-muted">
              Responda as perguntas e marque as sugestões que devem entrar na
              reescrita. Você pode pular uma pergunta se não tiver o dado.
            </p>
            <div className="max-h-[50vh] space-y-5 overflow-y-auto pr-1">
              {bulletGroups.map(({ bulletIndex: bi, questions, analysis }) => {
                const showBullet = expandedBullets[bi] ?? false;
                const bulletText = getBulletOriginalText(
                  analyses,
                  experience,
                  bi
                );
                return (
                  <div key={bi} className="space-y-3">
                    {mode === "experience" ? (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          Bullet {bi + 1}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-muted"
                          aria-label="Ver bullet original"
                          title="Ver bullet"
                          onClick={() =>
                            setExpandedBullets((prev) => ({
                              ...prev,
                              [bi]: !showBullet,
                            }))
                          }
                        >
                          <AlignLeft className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-muted"
                          aria-label="Ver bullet original"
                          title="Ver bullet"
                          onClick={() =>
                            setExpandedBullets((prev) => ({
                              ...prev,
                              [bi]: !showBullet,
                            }))
                          }
                        >
                          <AlignLeft className="size-3.5" />
                        </Button>
                      </div>
                    )}
                    {showBullet ? (
                      <p className="rounded-md border border-border bg-surface/50 px-2 py-1.5 text-xs text-muted">
                        {bulletText || "—"}
                      </p>
                    ) : null}

                    {questions.map(({ question }) => {
                      const key = answerKey(bi, question.component);
                      const isSkipped = skipped[key] ?? false;
                      return (
                        <div
                          key={key}
                          className="space-y-2 rounded-lg border border-border bg-elevated p-3"
                        >
                          <p className="text-xs font-medium text-text-secondary">
                            {STAR_COMPONENT_LABELS[question.component]}
                          </p>
                          <Label>{question.question}</Label>
                          {question.hint ? (
                            <p className="text-xs text-muted">{question.hint}</p>
                          ) : null}
                          <Textarea
                            className="min-h-[80px]"
                            value={answers[key] ?? ""}
                            disabled={isSkipped}
                            onChange={(e) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            placeholder="Sua resposta…"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSkipped((prev) => ({
                                ...prev,
                                [key]: !isSkipped,
                              }))
                            }
                          >
                            {isSkipped ? "Responder" : "Pular"}
                          </Button>
                        </div>
                      );
                    })}

                    {analysis?.suggestions.length ? (
                      <StarSuggestionsList
                        suggestions={analysis.suggestions}
                        bulletIndex={bi}
                        selections={selectedSuggestions}
                        onChange={updateSuggestionSelection}
                        interactive
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
            {error ? <p className="text-sm text-accent">{error}</p> : null}
            <div className="space-y-2">
              {mode === "experience" ? (
                <p className="text-xs text-muted">
                  Reescreve apenas os bullets com perguntas ou sugestões
                  marcadas. O formulário só muda ao clicar em Aplicar.
                </p>
              ) : (
                <p className="text-xs text-muted">
                  O formulário só muda ao clicar em Aplicar no próximo passo.
                </p>
              )}
              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("intro")}
                >
                  <ChevronLeft className="size-4" /> Voltar
                </Button>
                <Button type="button" onClick={() => void handleSubmitAnswers()}>
                  Reescrever <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        ) : null}

        {step === "review" ? (
          <>
            <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
              {rewrites.map((rewrite) => {
                const analysis = analyses.find(
                  (a) => a.bulletIndex === rewrite.bulletIndex
                );
                return (
                  <div
                    key={rewrite.bulletIndex}
                    className="space-y-3 rounded-lg border border-border bg-elevated p-4"
                  >
                    <p className="text-xs font-medium text-text-secondary">
                      Bullet {rewrite.bulletIndex + 1}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted">
                          Original
                        </p>
                        <p className="text-sm text-text-secondary">
                          {rewrite.original || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-accent">
                          Reescrito
                        </p>
                        <p className="text-sm text-foreground">
                          {rewrite.rewritten}
                        </p>
                      </div>
                    </div>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-text-secondary">
                        Ver breakdown STAR
                      </summary>
                      <div className="mt-2">
                        <StarBreakdown breakdown={rewrite.breakdown} />
                      </div>
                    </details>
                    {analysis?.suggestions.length ? (
                      <StarSuggestionsList
                        suggestions={analysis.suggestions}
                        bulletIndex={rewrite.bulletIndex}
                        selections={selectedSuggestions}
                        interactive={false}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted">
              Revise antes de aplicar. Só estes bullets serão atualizados no
              formulário.
            </p>
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setStep(
                    questionEntries.length ||
                      analyses.some((a) => a.suggestions.length)
                      ? "questions"
                      : "intro"
                  )
                }
              >
                <ChevronLeft className="size-4" /> Voltar
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
