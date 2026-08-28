"use client";

import type { AiResumeOutput } from "@/lib/ai/types";

type Props = {
  preview: AiResumeOutput;
};

export function ResumePreview({ preview }: Props) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface/50 p-4 text-sm">
      <div>
        <p className="font-medium">{preview.name || "—"}</p>
        <p className="text-muted">{preview.targetRole || "—"}</p>
        <p className="text-xs text-muted">
          {[preview.location, preview.email, preview.phone]
            .filter(Boolean)
            .join(" · ") || "—"}
        </p>
      </div>
      {preview.summary ? (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-muted">Resumo</p>
          <p className="text-text-secondary">{preview.summary}</p>
        </div>
      ) : null}
      {preview.skillCategories.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-muted">Skills</p>
          <ul className="space-y-1 text-text-secondary">
            {preview.skillCategories.map((cat, i) => (
              <li key={i}>
                <span className="font-medium">{cat.name}:</span> {cat.items}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {preview.experiences.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-muted">
            Experiência
          </p>
          <ul className="space-y-2 text-text-secondary">
            {preview.experiences.map((exp, i) => (
              <li key={i}>
                <p className="font-medium">
                  {exp.title} — {exp.company}
                </p>
                <p className="text-xs text-muted">{exp.period}</p>
                {exp.bullets.length > 0 ? (
                  <ul className="mt-1 list-inside list-disc text-xs">
                    {exp.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {preview.education.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-muted">
            Formação
          </p>
          <ul className="space-y-1 text-text-secondary">
            {preview.education.map((edu, i) => (
              <li key={i}>
                {edu.degree} — {edu.institution} ({edu.period})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
