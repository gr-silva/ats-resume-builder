"use client";

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
  cryptoRandomId,
  type ResumeData,
} from "@/lib/resume/schema";
import { Plus, Trash2 } from "lucide-react";

type Props = {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
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

export function ResumeForm({ data, onChange }: Props) {
  const update = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <Tabs defaultValue="dados" className="w-full">
      <TabsList>
        <TabsTrigger value="dados">Dados</TabsTrigger>
        <TabsTrigger value="resumo">Resumo</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="experiencia">Experiência</TabsTrigger>
        <TabsTrigger value="formacao">Formação</TabsTrigger>
        <TabsTrigger value="extra">Extra</TabsTrigger>
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
              placeholder="Software Engineer | Full Stack"
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
            placeholder="3–4 linhas densas em palavras-chave: stack, anos de experiência e 1–2 resultados mensuráveis."
          />
        </Field>
        <p className="text-xs text-muted">
          Dica ATS: cite tecnologias pelo nome e feche com resultados (%, tempo,
          volume).
        </p>
      </TabsContent>

      <TabsContent value="skills" className="space-y-4">
        {data.skillCategories.map((cat, index) => (
          <div
            key={cat.id}
            className="space-y-3 rounded-lg border border-border bg-elevated p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Field label="Categoria">
                  <Input
                    value={cat.name}
                    onChange={(e) => {
                      const next = [...data.skillCategories];
                      next[index] = { ...cat, name: e.target.value };
                      update("skillCategories", next);
                    }}
                    placeholder="Ex.: Linguagens"
                  />
                </Field>
                <Field label="Itens (separados por vírgula)">
                  <Input
                    value={cat.items}
                    onChange={(e) => {
                      const next = [...data.skillCategories];
                      next[index] = { ...cat, items: e.target.value };
                      update("skillCategories", next);
                    }}
                    placeholder="TypeScript, JavaScript, Python"
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
        <p className="text-xs text-muted">
          STAR comprimido: cada bullet = contexto + ação/tecnologia + resultado
          mensurável. Evite frases genéricas.
        </p>
        {data.experiences.map((exp, expIndex) => (
          <div
            key={exp.id}
            className="space-y-3 rounded-lg border border-border bg-elevated p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">
                Experiência {expIndex + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
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
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Cargo">
                <Input
                  value={exp.title}
                  onChange={(e) => {
                    const next = [...data.experiences];
                    next[expIndex] = { ...exp, title: e.target.value };
                    update("experiences", next);
                  }}
                  placeholder="Software Engineer"
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
              <Label>Bullets (STAR)</Label>
              {exp.bullets.map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="flex gap-2">
                  <Textarea
                    className="min-h-[72px]"
                    value={bullet}
                    onChange={(e) => {
                      const next = [...data.experiences];
                      const bullets = [...exp.bullets];
                      bullets[bulletIndex] = e.target.value;
                      next[expIndex] = { ...exp, bullets };
                      update("experiences", next);
                    }}
                    placeholder="Desenvolvi X com Y, resultando em Z (número)."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Remover bullet"
                    onClick={() => {
                      const next = [...data.experiences];
                      next[expIndex] = {
                        ...exp,
                        bullets: exp.bullets.filter((_, i) => i !== bulletIndex),
                      };
                      update("experiences", next);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
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
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
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
  );
}
