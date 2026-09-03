# ATS Resume Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/gr-silva/ats-resume-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/gr-silva/ats-resume-builder/actions/workflows/ci.yml)

Gerador **gratuito e open source** de currículos otimizados para ATS (Markdown + PDF).

**App:** [ats-resume-builder-topaz.vercel.app](https://ats-resume-builder-topaz.vercel.app)

Preencha os campos base na web, visualize o Markdown e baixe o PDF — **foco Geral** no MVP.

Identidade visual: [rochapontodev](https://rochapontodev.vercel.app) / Rocha Design Kit (dark + accent `#EF4444`).

## Escopo do MVP

- Geração ATS no **foco Geral** (Markdown + PDF)
- Formulário na plataforma + rascunho no navegador (`localStorage`)
- **Assistente IA** (Chrome Prompt API / Gemini Nano on-device): wizard de perguntas e importação por texto
- Nichos (Full Stack, IA…), revisão com IA na nuvem e conta na nuvem: **roadmap**

## Assistente IA (Chrome)

O assistente usa a [Prompt API do Chrome](https://developer.chrome.com/docs/ai/prompt-api) com **Gemini Nano** — processamento **100% local**, sem API key e sem envio de dados a servidores externos.

**Requisitos:**

- Chrome desktop **148+** (Windows, macOS, Linux ou Chromebook Plus)
- ~16 GB RAM, GPU com 4+ GB VRAM, ~22 GB de espaço livre
- Primeiro uso pode baixar o modelo (~2–4 GB)

**Funcionalidades:**

1. **Assistente IA** — responda perguntas curtas e preencha o formulário automaticamente
2. **Importar** — cole o texto do currículo (ou carregue `.txt`/`.md`) e extraia os campos
3. **Revisar STAR** — analise e reescreva bullets no formato STAR comprimido; se faltar Situação, Tarefa, Ação ou Resultado, a IA faz perguntas antes de reescrever (por bullet ou por experiência inteira)

**Compatibilidade:** Firefox, Safari e mobile não suportam a Prompt API — os botões de IA ficam desabilitados; o preenchimento manual continua disponível.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- shadcn/ui (Radix) + tokens da marca Rocha
- Zod (validação)
- PDFKit (PDF ATS single-column no servidor)
- Persistência local: `localStorage` (sem login)

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run test
npm run build
npm start
```

### Troubleshooting da IA (Chrome)

- [Documentação da Prompt API](https://developer.chrome.com/docs/ai/prompt-api)
- Verifique o modelo em `chrome://on-device-internals`
- Em versões anteriores ao Chrome 148, pode ser necessário habilitar flags experimentais em `chrome://flags` (ex.: *Prompt API for Gemini Nano*)
- Use **Preparar IA** no painel lateral ou nos dialogs para baixar o modelo antes de gerar

## Uso

1. Preencha Dados, Resumo, Skills, Experiência (bullets STAR comprimidos), Formação e Extra.
2. Use **Assistente IA** (Chrome) para acelerar o preenchimento ou **Importar** para colar um currículo existente.
3. Na aba Experiência, use **Revisar STAR** em cada bullet ou **Revisar STAR (todos)** no bloco da experiência.
4. Use **Carregar demo** para ver um exemplo fictício (Alex Rivera).
5. Baixe **MD** ou **PDF** (foco Geral).
6. O rascunho é salvo automaticamente no navegador.

## Privacidade (MVP)

Nenhum currículo é armazenado em servidor. O PDF é gerado sob demanda; o rascunho fica só no seu navegador (`localStorage`). O assistente IA processa dados **localmente no Chrome** (Gemini Nano) — o texto do currículo, importações e respostas da IA **não** são enviados a APIs externas nem a banco de dados. Sem cadastro neste MVP.

**Analytics:** o deploy na Vercel usa [Web Analytics](https://vercel.com/docs/analytics) para métricas **agregadas** de acesso (visitas e páginas). Isso **não** inclui nem analisa campos do formulário, bullets, rascunho ou saídas da IA. Para ver os números no painel, ative Web Analytics no projeto na [dashboard da Vercel](https://vercel.com/dashboard).

## Como contribuir

Contribuições são bem-vindas. Leia o [Guia de contribuição](CONTRIBUTING.md) e o [Código de conduta](CODE_OF_CONDUCT.md).

A branch `main` é protegida: use **fork → PR**. Issues com label `good first issue` são um bom ponto de partida.

Segurança: [SECURITY.md](SECURITY.md) — não abra issue pública para vulnerabilidades.

## Arquitetura

```
src/lib/resume/     # schema, markdown, blocks, PDF
src/lib/ai/         # Chrome Prompt API, prompts, merge
src/lib/focus/      # geral ativo; fullstack/ia stubs para o futuro
src/app/api/pdf/    # POST gera PDF
src/components/     # formulário + assistente IA + UI
```

- `applyFocus(data, focusId)` — hoje identidade para `geral`; ponto de extensão para nichos + IA.
- Focos `fullstack` e `ia` existem como stubs e aparecem na UI como “em breve”.

## Roadmap

- [ ] Seleção de nicho (Full Stack, IA, custom)
- [x] Revisão / reescrita STAR com IA (Chrome local, com perguntas quando faltar info)
- [ ] Conta + salvamento na nuvem
- [ ] Export DOCX / textos LinkedIn
- [x] Deploy na Vercel
- [x] Assistente IA local (Chrome Prompt API)

## Licença

[MIT](LICENSE)
