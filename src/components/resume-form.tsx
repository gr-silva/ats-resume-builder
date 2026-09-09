"use client";

import { StarReviewDialog } from "@/components/ai-assistant/star-review-dialog";
import { useChromeAiContext } from "@/components/ai-assistant/chrome-ai-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  FORM_TAB_IDS,
  FORM_TAB_LABELS,
  FORM_TAB_NEXT_HINTS,
  getFormProgress,
  type FormTabId,
} from "@/lib/resume/form-progress";
import {
  appendSkillChip,
  joinSkillChips,
  parseSkillChips,
} from "@/lib/resume/skill-chips";
import {
  cryptoRandomId,
  type Experience,
  type ResumeData,
} from "@/lib/resume/schema";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";

type StarReviewTarget = {
  expIndex: number;
  mode: "bullet" | "experience";
  bulletIndex?: number;
};

type Props = {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  tab?: FormTabId;
  onTabChange?: (tab: FormTabId) => void;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  return next;
}

function SkillChipsField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const chips = parseSkillChips(value);
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const next = appendSkillChip(chips, draft);
    if (!next) {
      setDraft("");
      return;
    }
    onChange(joinSkillChips(next));
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && !draft && chips.length) {
      onChange(joinSkillChips(chips.slice(0, -1)));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <Badge key={chip} className="gap-1 pr-1">
            {chip}
            <button
              type="button"
              className="rounded p-0.5 text-muted hover:text-foreground"
              aria-label={`Remover ${chip}`}
              onClick={() =>
                onChange(joinSkillChips(chips.filter((c) => c !== chip)))
              }
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commitDraft}
        placeholder={placeholder}
      />
      <p className="text-xs text-muted">Enter ou vírgula para adicionar.</p>
    </div>
  );
}

export function ResumeForm({ data, onChange, tab: tabProp, onTabChange }: Props) {
  const { isSupported, checking } = useChromeAiContext();
  const [starReview, setStarReview] = useState<StarReviewTarget | null>(null);
  const [internalTab, setInternalTab] = useState<FormTabId>("dados");
  const tab = tabProp ?? internalTab;
  const setTab = (next: FormTabId) => {
    onTabChange?.(next);
    if (tabProp === undefined) setInternalTab(next);
  };
  const progress = useMemo(() => getFormProgress(data), [data]);
  const currentStatus = progress.sections[tab];
  const nextIncomplete = FORM_TAB_IDS.find(
    (id) => id !== tab && progress.sections[id] !== "done"
  );

  const update = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    onChange({ ...data, [key]: value });
  };

  function applyExperienceUpdate(expIndex: number, experience: Experience) {
    const next = [...data.experiences];
    next[expIndex] = experience;
    update("experiences", next);
  }

  const starReviewExperience =
    starReview !== null ? data.experiences[starReview.expIndex] : null;

  const showGuidance =
    progress.doneCount === 0 || currentStatus === "empty";

  return (
    <>
      <p className="mb-3 text-sm text-muted" aria-live="polite">
        Progresso{" "}
        <span className="font-medium text-foreground">
          {progress.doneCount}/{progress.total}
        </span>
      </p>

      {showGuidance ? (
        <div className="mb-4 space-y-2 rounded-lg border border-border bg-background/60 p-3">
          <p className="text-sm text-text-secondary">
            {FORM_TAB_NEXT_HINTS[tab]}
          </p>
          <p className="text-xs text-muted">
            Preencha o essencial e baixe o PDF quando o preview estiver bom.
          </p>
          {currentStatus === "done" && nextIncomplete ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTab(nextIncomplete)}
            >
              Ir para {FORM_TAB_LABELS[nextIncomplete]}
            </Button>
          ) : null}
        </div>
      ) : currentStatus === "done" && nextIncomplete ? (
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTab(nextIncomplete)}
          >
            Próximo: {FORM_TAB_LABELS[nextIncomplete]}
          </Button>
        </div>
      ) : null}

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as FormTabId)}
        className="w-full"
      >
        <TabsList aria-label="Seções do currículo">
          {FORM_TAB_IDS.map((id) => {
            const status = progress.sections[id];
            return (
              <TabsTrigger
                key={id}
                value={id}
                title={`${FORM_TAB_LABELS[id]}: ${status === "done" ? "preenchido" : status === "partial" ? "parcial" : "vazio"}`}
                className="gap-1.5"
              >
                {status === "done" ? (
                  <Check className="size-3 text-accent" aria-hidden />
                ) : (
                  <span
                    className={`size-1.5 rounded-full ${
                      status === "partial" ? "bg-text-secondary" : "bg-border"
                    }`}
                    aria-hidden
                  />
                )}
                {FORM_TAB_LABELS[id]}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="dados" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo">
              <Input
                value={data.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Seu nome"
              />
            </Field>
            <Field label="Cargo-alvo">
              <Input
                value={data.targetRole}
                onChange={(e) => update("targetRole", e.target.value)}
                placeholder="Ex.: Analista de dados | Product designer"
              />
            </Field>
            <Field label="Cidade / UF">
              <Input
                value={data.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Cidade, UF"
              />
            </Field>
            <Field label="Telefone">
              <Input
                value={data.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+55 (00) 00000-0000"
              />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                value={data.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="voce@email.com"
              />
            </Field>
            <Field label="LinkedIn">
              <Input
                value={data.linkedin}
                onChange={(e) => update("linkedin", e.target.value)}
                placeholder="linkedin.com/in/seu-perfil"
              />
            </Field>
            <Field label="Portfólio">
              <Input
                value={data.portfolio}
                onChange={(e) => update("portfolio", e.target.value)}
                placeholder="seusite.dev"
              />
            </Field>
          </div>
        </TabsContent>

        <TabsContent value="resumo" className="space-y-4">
          <Field label="Resumo profissional">
            <Textarea
              className="min-h-[180px]"
              value={data.summary}
              onChange={(e) => update("summary", e.target.value)}
              placeholder="3–4 linhas densas em palavras-chave: áreas de atuação, anos de experiência e 1–2 resultados mensuráveis."
            />
          </Field>
          <p className="text-xs text-muted">
            Dica ATS: cite ferramentas pelo nome e feche com resultados (%,
            tempo, volume).
          </p>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          {data.skillCategories.map((cat, index) => (
            <div
              key={cat.id}
              className="space-y-3 rounded-lg border border-border bg-elevated p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="grid flex-1 gap-3">
                  <Field label="Categoria">
                    <Input
                      value={cat.name}
                      onChange={(e) => {
                        const next = [...data.skillCategories];
                        next[index] = { ...cat, name: e.target.value };
                        update("skillCategories", next);
                      }}
                      placeholder="Ex.: Competências"
                    />
                  </Field>
                  <Field label="Itens">
                    <SkillChipsField
                      value={cat.items}
                      onChange={(items) => {
                        const next = [...data.skillCategories];
                        next[index] = { ...cat, items };
                        update("skillCategories", next);
                      }}
                      placeholder="Ex.: Excel, SQL, Figma"
                    />
                  </Field>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Remover categoria"
                  onClick={() =>
                    update(
                      "skillCategories",
                      data.skillCategories.filter((c) => c.id !== cat.id)
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update("skillCategories", [
                ...data.skillCategories,
                { id: cryptoRandomId(), name: "", items: "" },
              ])
            }
          >
            <Plus className="size-4" /> Categoria
          </Button>
        </TabsContent>

        <TabsContent value="experiencia" className="space-y-4">
          <details className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-muted">
            <summary className="cursor-pointer text-sm text-text-secondary">
              Como escrever um bom bullet
            </summary>
            <p className="mt-2 leading-relaxed">
              Situação → Tarefa → Ação → Resultado (número ou impacto). Evite
              frases genéricas; cite ferramentas e o efeito do seu trabalho.
            </p>
          </details>
          {!isSupported && !checking ? (
            <p className="text-xs text-muted">
              Melhoria de bullets com IA disponível no Chrome desktop.
            </p>
          ) : null}
          {data.experiences.map((exp, expIndex) => (
            <div
              key={exp.id}
              className="space-y-3 rounded-lg border border-border bg-elevated p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-text-secondary">
                  Experiência {expIndex + 1}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {isSupported ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={checking}
                      title="Revisar STAR de todos os bullets"
                      onClick={() =>
                        setStarReview({ expIndex, mode: "experience" })
                      }
                    >
                      <Sparkles className="size-4" /> Melhorar todos com IA
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Mover experiência para cima"
                    disabled={expIndex === 0}
                    onClick={() =>
                      update(
                        "experiences",
                        moveItem(data.experiences, expIndex, -1)
                      )
                    }
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Mover experiência para baixo"
                    disabled={expIndex === data.experiences.length - 1}
                    onClick={() =>
                      update(
                        "experiences",
                        moveItem(data.experiences, expIndex, 1)
                      )
                    }
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Remover experiência"
                    onClick={() =>
                      update(
                        "experiences",
                        data.experiences.filter((e) => e.id !== exp.id)
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Cargo">
                  <Input
                    value={exp.title}
                    onChange={(e) => {
                      const next = [...data.experiences];
                      next[expIndex] = { ...exp, title: e.target.value };
                      update("experiences", next);
                    }}
                    placeholder="Cargo"
                  />
                </Field>
                <Field label="Empresa">
                  <Input
                    value={exp.company}
                    onChange={(e) => {
                      const next = [...data.experiences];
                      next[expIndex] = { ...exp, company: e.target.value };
                      update("experiences", next);
                    }}
                    placeholder="Empresa"
                  />
                </Field>
                <Field label="Período">
                  <Input
                    value={exp.period}
                    onChange={(e) => {
                      const next = [...data.experiences];
                      next[expIndex] = { ...exp, period: e.target.value };
                      update("experiences", next);
                    }}
                    placeholder="Jan/2023 – Presente"
                  />
                </Field>
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Bullets</Label>
                {exp.bullets.map((bullet, bulletIndex) => (
                  <div
                    key={bulletIndex}
                    className="flex flex-col gap-2 sm:flex-row"
                  >
                    <Textarea
                      className="min-h-[72px] flex-1"
                      value={bullet}
                      onChange={(e) => {
                        const next = [...data.experiences];
                        const bullets = [...exp.bullets];
                        bullets[bulletIndex] = e.target.value;
                        next[expIndex] = { ...exp, bullets };
                        update("experiences", next);
                      }}
                      placeholder="Em [contexto], fiz [ação] com [ferramenta], resultando em [impacto]."
                    />
                    <div className="flex flex-row gap-1 sm:flex-col">
                      {isSupported ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={checking || !bullet.trim()}
                          aria-label="Melhorar com IA"
                          title="Revisar e reescrever no formato STAR"
                          onClick={() =>
                            setStarReview({
                              expIndex,
                              mode: "bullet",
                              bulletIndex,
                            })
                          }
                        >
                          <Sparkles className="size-4" />
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Remover bullet"
                        onClick={() => {
                          const next = [...data.experiences];
                          next[expIndex] = {
                            ...exp,
                            bullets: exp.bullets.filter(
                              (_, i) => i !== bulletIndex
                            ),
                          };
                          update("experiences", next);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = [...data.experiences];
                    next[expIndex] = {
                      ...exp,
                      bullets: [...exp.bullets, ""],
                    };
                    update("experiences", next);
                  }}
                >
                  <Plus className="size-4" /> Bullet
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update("experiences", [
                ...data.experiences,
                {
                  id: cryptoRandomId(),
                  title: "",
                  company: "",
                  period: "",
                  bullets: [""],
                },
              ])
            }
          >
            <Plus className="size-4" /> Experiência
          </Button>
        </TabsContent>

        <TabsContent value="formacao" className="space-y-4">
          {data.education.map((edu, index) => (
            <div
              key={edu.id}
              className="space-y-3 rounded-lg border border-border bg-elevated p-4"
            >
              <div className="flex justify-end gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Mover formação para cima"
                  disabled={index === 0}
                  onClick={() =>
                    update("education", moveItem(data.education, index, -1))
                  }
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Mover formação para baixo"
                  disabled={index === data.education.length - 1}
                  onClick={() =>
                    update("education", moveItem(data.education, index, 1))
                  }
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Remover formação"
                  onClick={() =>
                    update(
                      "education",
                      data.education.filter((e) => e.id !== edu.id)
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Curso / grau">
                  <Input
                    value={edu.degree}
                    onChange={(e) => {
                      const next = [...data.education];
                      next[index] = { ...edu, degree: e.target.value };
                      update("education", next);
                    }}
                  />
                </Field>
                <Field label="Instituição">
                  <Input
                    value={edu.institution}
                    onChange={(e) => {
                      const next = [...data.education];
                      next[index] = { ...edu, institution: e.target.value };
                      update("education", next);
                    }}
                  />
                </Field>
                <Field label="Período">
                  <Input
                    value={edu.period}
                    onChange={(e) => {
                      const next = [...data.education];
                      next[index] = { ...edu, period: e.target.value };
                      update("education", next);
                    }}
                    placeholder="2018 – 2021"
                  />
                </Field>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update("education", [
                ...data.education,
                {
                  id: cryptoRandomId(),
                  degree: "",
                  institution: "",
                  period: "",
                },
              ])
            }
          >
            <Plus className="size-4" /> Formação
          </Button>
        </TabsContent>

        <TabsContent value="extra" className="space-y-6">
          <div className="space-y-3">
            <Label>Cursos / certificações</Label>
            {data.courses.map((course, index) => (
              <div key={course.id} className="flex gap-2">
                <Input
                  value={course.text}
                  onChange={(e) => {
                    const next = [...data.courses];
                    next[index] = { ...course, text: e.target.value };
                    update("courses", next);
                  }}
                  placeholder="Nome do curso — plataforma (ano)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    update(
                      "courses",
                      data.courses.filter((c) => c.id !== course.id)
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                update("courses", [
                  ...data.courses,
                  { id: cryptoRandomId(), text: "" },
                ])
              }
            >
              <Plus className="size-4" /> Curso
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Idiomas</Label>
            {data.languages.map((lang, index) => (
              <div key={lang.id} className="grid gap-2 sm:grid-cols-2">
                <Input
                  value={lang.name}
                  onChange={(e) => {
                    const next = [...data.languages];
                    next[index] = { ...lang, name: e.target.value };
                    update("languages", next);
                  }}
                  placeholder="Idioma"
                />
                <div className="flex gap-2">
                  <Input
                    value={lang.level}
                    onChange={(e) => {
                      const next = [...data.languages];
                      next[index] = { ...lang, level: e.target.value };
                      update("languages", next);
                    }}
                    placeholder="Nível"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      update(
                        "languages",
                        data.languages.filter((l) => l.id !== lang.id)
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                update("languages", [
                  ...data.languages,
                  { id: cryptoRandomId(), name: "", level: "" },
                ])
              }
            >
              <Plus className="size-4" /> Idioma
            </Button>
          </div>

          <Separator />

          <Field label="Disponibilidade">
            <Input
              value={data.availability}
              onChange={(e) => update("availability", e.target.value)}
              placeholder="Remoto; híbrido ou presencial. Início imediato."
            />
          </Field>
        </TabsContent>
      </Tabs>

      {starReview && starReviewExperience ? (
        <StarReviewDialog
          open
          onOpenChange={(open) => {
            if (!open) setStarReview(null);
          }}
          mode={starReview.mode}
          experience={starReviewExperience}
          bulletIndex={starReview.bulletIndex}
          onApply={(updated) =>
            applyExperienceUpdate(starReview.expIndex, updated)
          }
        />
      ) : null}
    </>
  );
}
