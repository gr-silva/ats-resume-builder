import { Shield } from "lucide-react";

/** Collapsible privacy disclosure — muted so it does not compete with Começar. */
export function PrivacyNotice() {
  return (
    <details className="group text-xs text-muted">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-muted transition-colors hover:text-text-secondary [&::-webkit-details-marker]:hidden">
        <Shield className="size-3.5 shrink-0 opacity-70" aria-hidden />
        <span>Privacidade</span>
        <span className="text-border" aria-hidden>
          ·
        </span>
        <span className="font-normal">
          Analytics agregado; currículo fica no navegador
        </span>
      </summary>
      <div
        role="note"
        aria-label="Aviso de privacidade"
        className="mt-2 space-y-1.5 leading-relaxed text-muted"
      >
        <p>
          Usamos o Vercel Web Analytics só para métricas agregadas de acesso
          (visitas e páginas).{" "}
          <strong className="font-medium text-text-secondary">
            Não enviamos nem analisamos
          </strong>{" "}
          o texto do currículo, o rascunho, importações ou respostas da IA.
        </p>
        <p>
          O rascunho fica no seu navegador (<code>localStorage</code>). O
          assistente IA (quando disponível) roda localmente no Chrome — Gemini
          Nano, sem API externa.
        </p>
      </div>
    </details>
  );
}
