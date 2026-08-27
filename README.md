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
- Nichos (Full Stack, IA…), revisão com IA e conta na nuvem: **roadmap** — abra uma Discussion/issue antes de PRs grandes nessas frentes

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
npm run build
npm start
```

## Uso

1. Preencha Dados, Resumo, Skills, Experiência (bullets STAR comprimidos), Formação e Extra.
2. Use **Carregar demo** para ver um exemplo fictício (Alex Rivera).
3. Baixe **MD** ou **PDF** (foco Geral).
4. O rascunho é salvo automaticamente no navegador.

## Privacidade (MVP)

Nenhum currículo é armazenado em servidor. O PDF é gerado sob demanda; o rascunho fica só no seu navegador (`localStorage`). Sem cadastro e sem banco de dados neste MVP.

## Como contribuir

Contribuições são bem-vindas. Leia o [Guia de contribuição](CONTRIBUTING.md) e o [Código de conduta](CODE_OF_CONDUCT.md).

A branch `main` é protegida: use **fork → PR**. Issues com label `good first issue` são um bom ponto de partida.

Segurança: [SECURITY.md](SECURITY.md) — não abra issue pública para vulnerabilidades.

## Arquitetura

```
src/lib/resume/     # schema, markdown, blocks, PDF
src/lib/focus/      # geral ativo; fullstack/ia stubs para o futuro
src/app/api/pdf/    # POST gera PDF
src/components/     # formulário + UI
```

- `applyFocus(data, focusId)` — hoje identidade para `geral`; ponto de extensão para nichos + IA.
- Focos `fullstack` e `ia` existem como stubs e aparecem na UI como “em breve”.

## Roadmap

- [ ] Seleção de nicho (Full Stack, IA, custom)
- [ ] Revisão / reescrita STAR com IA
- [ ] Conta + salvamento na nuvem
- [ ] Export DOCX / textos LinkedIn
- [x] Deploy na Vercel

## Licença

[MIT](LICENSE)
