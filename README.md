# ATS Resume Builder

Gerador gratuito de currículos otimizados para ATS (Markdown + PDF).

Preencha os campos base na web, visualize o Markdown e baixe o PDF — **foco Geral** no MVP.

Identidade visual: [rochapontodev](https://rochapontodev.vercel.app) / Rocha Design Kit (dark + accent `#EF4444`).

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
npm run build
npm start
```

## Uso

1. Preencha Dados, Resumo, Skills, Experiência (bullets STAR comprimidos), Formação e Extra.
2. Use **Carregar demo** para ver um exemplo fictício (Alex Rivera).
3. Baixe **MD** ou **PDF** (foco Geral).
4. O rascunho é salvo automaticamente no navegador.

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

## Privacidade (MVP)

Nenhum currículo é armazenado em servidor. O PDF é gerado sob demanda; o rascunho fica só no seu navegador.

## Licença

MIT
