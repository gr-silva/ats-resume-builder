"use client";

import { ImportDialog } from "@/components/ai-assistant/import-dialog";
import { AiSetupPanel } from "@/components/ai-assistant/ai-setup-panel";
import {
  ChromeAiProvider,
  useChromeAiContext,
} from "@/components/ai-assistant/chrome-ai-provider";
import { WizardDialog } from "@/components/ai-assistant/wizard-dialog";
import { ResumePdfPreview } from "@/components/resume-pdf-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toast, type ToastMessage } from "@/components/ui/toast";
import { PrivacyNotice } from "@/components/privacy-notice";
import { ResumeForm } from "@/components/resume-form";
import { useResumeDraft } from "@/hooks/use-resume-draft";
import { FOCUS_LABELS } from "@/lib/focus";
import { createDemoResume } from "@/lib/resume/demo";
import { buildMarkdown } from "@/lib/resume/build-markdown";
import { isResumeTooEmpty } from "@/lib/resume/is-resume-too-empty";
import { Download, Eraser, FileText, Play, Sparkles, Upload } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export function BuilderApp() {
  return (
    <ChromeAiProvider>
      <BuilderAppContent />
    </ChromeAiProvider>
  );
}

type PendingExport = "pdf" | "markdown" | null;

function BuilderAppContent() {
  const { data, setData, hydrated, reset, loadDemo } = useResumeDraft();
  const { isSupported, checking } = useChromeAiContext();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [pendingExport, setPendingExport] = useState<PendingExport>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const markdown = useMemo(() => buildMarkdown(data, "geral"), [data]);

  const showToast = useCallback((text: string) => {
    setToast({ id: Date.now(), text });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  async function runPdfDownload() {
    setError(null);
    setPdfLoading(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, focus: "geral" }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error || "Não foi possível gerar o PDF.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(data.name || "curriculo").trim() || "curriculo"}-ATS-Geral.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("PDF baixado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao baixar PDF.");
    } finally {
      setPdfLoading(false);
    }
  }

  function runMarkdownDownload() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.name || "curriculo").trim() || "curriculo"}-ATS-Geral.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Markdown baixado");
  }

  function requestExport(kind: "pdf" | "markdown") {
    if (isResumeTooEmpty(data)) {
      setPendingExport(kind);
      return;
    }
    if (kind === "pdf") {
      void runPdfDownload();
    } else {
      runMarkdownDownload();
    }
  }

  function confirmEmptyExport() {
    const kind = pendingExport;
    setPendingExport(null);
    if (kind === "pdf") {
      void runPdfDownload();
    } else if (kind === "markdown") {
      runMarkdownDownload();
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Carregando rascunho…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      <header className="mb-10 max-w-2xl">
        <div className="flex items-center text-sm font-medium">
          <span>rochaponto</span>
          <span className="text-accent">dev</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          ATS Resume Builder
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          Preencha o formulário e baixe Markdown ou PDF em qualquer navegador —
          foco Geral, gratuito, sem cadastro. Assistente IA é opcional (Chrome
          desktop).
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Badge className="border-accent/40 bg-accent/10 text-accent">
            Qualquer navegador
          </Badge>
          <Badge>Foco: {FOCUS_LABELS.geral}</Badge>
          <Badge
            title={
              isSupported
                ? "Assistente IA local via Chrome (Gemini Nano)"
                : "Opcional — requer Chrome desktop 148+ com hardware compatível"
            }
          >
            IA opcional (Chrome)
          </Badge>
          <Badge title="Nichos Full Stack e IA — em breve">
            Full Stack — em breve
          </Badge>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <a href="#editor">Começar</a>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => loadDemo(createDemoResume())}
          >
            <Play className="size-4" /> Carregar demo
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-muted">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted hover:text-foreground"
            onClick={reset}
          >
            <Eraser className="size-3.5" /> Limpar
          </Button>
          {isSupported ? (
            <>
              <span aria-hidden className="select-none text-border">
                ·
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted hover:text-foreground"
                disabled={checking}
                title="Preencher com assistente IA"
                onClick={() => setWizardOpen(true)}
              >
                <Sparkles className="size-3.5" /> Assistente IA
              </Button>
              <span aria-hidden className="select-none text-border">
                ·
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted hover:text-foreground"
                disabled={checking}
                title="Importar currículo com IA"
                onClick={() => setImportOpen(true)}
              >
                <Upload className="size-3.5" /> Importar
              </Button>
            </>
          ) : !checking ? (
            <span className="px-2">
              IA local disponível no Chrome desktop.{" "}
              <a
                href="#ai-setup"
                className="text-accent underline-offset-2 hover:underline"
              >
                Saiba mais
              </a>
            </span>
          ) : null}
        </div>
      </header>

      <PrivacyNotice />

      <div
        id="editor"
        className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      >
        <section className="rounded-xl border border-border bg-elevated/80 p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-medium">Seus dados</h2>
          <ResumeForm data={data} onChange={setData} />
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-border bg-elevated/80 p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-medium">Preview</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => requestExport("markdown")}
                >
                  <FileText className="size-4" /> MD
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => requestExport("pdf")}
                  disabled={pdfLoading}
                >
                  <Download className="size-4" />
                  {pdfLoading ? "Gerando…" : "PDF"}
                </Button>
              </div>
            </div>
            <Separator className="mb-4" />
            {error ? (
              <p className="mb-3 text-sm text-accent">{error}</p>
            ) : null}
            <Tabs defaultValue="pdf">
              <TabsList className="w-auto">
                <TabsTrigger value="pdf">PDF</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
              </TabsList>
              <TabsContent value="pdf" className="mt-3">
                <ResumePdfPreview data={data} focus="geral" />
              </TabsContent>
              <TabsContent value="markdown" className="mt-3">
                <pre className="max-h-[70vh] overflow-auto overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed text-text-secondary sm:p-4">
                  {markdown.trim() ||
                    "Preencha o formulário para ver o preview."}
                </pre>
              </TabsContent>
            </Tabs>
          </div>
          <AiSetupPanel />
          <p className="text-xs text-muted">
            Rascunho salvo automaticamente no navegador (localStorage). O
            formulário e o export MD/PDF funcionam em qualquer navegador. A IA
            opcional processa dados localmente no Chrome (Gemini Nano) — conteúdo
            do currículo e respostas da IA não vão para API externa nem banco.
            Usamos Vercel Web Analytics só para visitas/páginas agregadas, sem
            analisar o texto preenchido. O preview PDF é uma aproximação visual;
            o arquivo baixado é gerado com PDFKit.
          </p>
        </aside>
      </div>

      {wizardOpen ? (
        <WizardDialog
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          currentData={data}
          onApply={setData}
        />
      ) : null}
      {importOpen ? (
        <ImportDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          currentData={data}
          onApply={setData}
        />
      ) : null}

      <Dialog
        open={pendingExport !== null}
        onOpenChange={(open) => {
          if (!open) setPendingExport(null);
        }}
        title="Currículo quase vazio"
        description="Falta nome ou experiência com conteúdo. O arquivo pode ficar sem utilidade para um ATS."
      >
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPendingExport(null)}
          >
            Continuar preenchendo
          </Button>
          <Button type="button" onClick={confirmEmptyExport}>
            Baixar mesmo assim
          </Button>
        </div>
      </Dialog>

      <Toast message={toast} onDismiss={dismissToast} />
    </div>
  );
}
