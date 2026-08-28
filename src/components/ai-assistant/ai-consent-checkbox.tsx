"use client";

import { Label } from "@/components/ui/label";
import { setAiConsent } from "@/lib/ai/consent";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function AiConsentCheckbox({ checked, onChange }: Props) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface/50 p-3">
      <input
        type="checkbox"
        className="mt-1 size-4 accent-accent"
        checked={checked}
        onChange={(e) => {
          const value = e.target.checked;
          onChange(value);
          setAiConsent(value);
        }}
      />
      <div className="space-y-1">
        <Label className="cursor-pointer font-normal">
          Entendo que meus dados serão processados localmente pelo modelo de IA
          do Chrome (Gemini Nano).
        </Label>
        <p className="text-xs text-muted">
          Nada é enviado a servidores externos. Requisitos: Chrome desktop 148+,
          ~16 GB RAM e GPU compatível.
        </p>
      </div>
    </label>
  );
}
