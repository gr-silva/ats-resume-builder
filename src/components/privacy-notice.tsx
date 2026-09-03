import { Shield } from "lucide-react";

export function PrivacyNotice() {
  return (
    <aside
      role="note"
      aria-label="Aviso de privacidade"
      className="mb-8 rounded-xl border border-border bg-elevated/80 px-4 py-3 sm:px-5"
    >
      <div className="flex gap-3">
        <Shield
          className="mt-0.5 size-4 shrink-0 text-accent"
          aria-hidden
        />
        <div className="space-y-1 text-sm leading-relaxed text-text-secondary">
          <p className="font-medium text-foreground">Privacidade</p>
          <p>
            Usamos o{" "}
            <span className="text-foreground">Vercel Web Analytics</span> só
            para métricas agregadas de acesso (visitas e páginas).{" "}
            <strong className="font-medium text-foreground">
              Não enviamos nem analisamos
            </strong>{" "}
            o texto do currículo, o rascunho, importações ou respostas da IA.
          </p>
          <p className="text-xs text-muted">
            O rascunho fica no seu navegador (<code>localStorage</code>). O
            assistente IA (quando disponível) roda localmente no Chrome —
            Gemini Nano, sem API externa.
          </p>
        </div>
      </div>
    </aside>
  );
}
