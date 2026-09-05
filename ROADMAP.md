# Roadmap — ATS Resume Builder

Princípio do produto: **local-first**.

- Rascunho no navegador (`localStorage`)
- Assistente IA on-device (Chrome / Gemini Nano), quando disponível
- Sem cadastro obrigatório e sem armazenar currículo em servidor no caminho principal

Qualquer evolução deve preservar essa promessa. Recursos que exijam guardar dados pessoais na nuvem ficam **fora do escopo ativo** (ver [Conta na nuvem](#conta-na-nuvem--fora-do-escopo-ativo)).

---

## Concluído

- [x] Geração ATS (foco Geral) — formulário, Markdown e PDF
- [x] Deploy na Vercel
- [x] Assistente IA local (Chrome Prompt API) — wizard + importação por texto
- [x] Revisão / reescrita STAR com IA local (perguntas, sugestões selecionáveis, preservação do texto)
- [x] Vercel Web Analytics (métricas agregadas de acesso) + aviso de privacidade na UI e no README

---

## Próximo (prioridade)

Ordenado pelo impacto no caminho que **a maioria** usa (formulário → exportar), não só quem tem Chrome + hardware para IA.

### 1. Caminho sem IA (maioria dos usuários)

Firefox, Safari e mobile não têm Prompt API — os botões de IA ficam desabilitados, mas a experiência ainda parece “IA-first”.

- [ ] Deixar óbvio que o fluxo principal (preencher + MD/PDF) funciona em qualquer navegador
- [ ] Mensagens/UX quando a IA estiver indisponível (sem parecer que o app “não funciona”)
- [ ] Revisar hierarquia de CTAs no header (Começar / formulário vs Assistente / Importar)
- [ ] Melhorias de layout e usabilidade em mobile (tabs, bullets, preview)

### 2. Fechar valor de exportação

- [ ] Export DOCX (ATS-friendly)
- [ ] Textos prontos para LinkedIn (sobre / experiências), gerados a partir do rascunho local — sem envio a servidor além do necessário para gerar o arquivo

### 3. Nichos (Full Stack, IA, …)

Hoje existem stubs e badges “em breve” na UI.

- [ ] Ativar seleção de nicho de forma útil (reordenar/ênfase de skills e experiências) **ou**
- [ ] Remover/suavizar badges “em breve” até o recurso existir — evitar promessa vazia

### 4. Qualidade da IA local (Chrome)

- [ ] Continuar polindo prompts STAR (preservar conteúdo, aplicar sugestões sem inventar métricas)
- [ ] Troubleshooting / onboarding mais claros para download do modelo e hardware mínimo
- [ ] Avaliar eventos de analytics **só de produto** (ex.: abriu wizard) com disclosure explícito — sem texto do currículo (opcional; só se a privacidade continuar clara)

### 5. Apoio ao projeto (open source)

Doação é opcional e **nunca** paywall.

- [ ] Link discreto “Apoiar o projeto” no README (GitHub Sponsors / Ko-fi / equivalente)
- [ ] Botão/CTA na UI **somente depois** de baseline estável de analytics (visitas recorrentes, não só pico de post) — preferir rodapé/aside, não competir com Começar / PDF

---

## Depois / sob demanda

- [ ] Melhorias de acessibilidade (foco, labels, contraste)
- [ ] Mais templates ATS single-column (ainda locais)
- [ ] Internacionalização (EN) se houver demanda
- [ ] Contribuições comunitárias (`good first issue`) alinhadas a este roadmap

---

## Conta na nuvem — fora do escopo ativo

**Não planejamos** conta + salvamento de currículo na nuvem neste momento.

Motivos alinhados ao produto:

- Quebraria o posicionamento **local-first** (dados do usuário em banco)
- Implicaria política de privacidade, retenção, exclusão e responsabilidade sobre PII
- O MVP já resolve persistência com `localStorage` e export MD/PDF

Se no futuro houver demanda forte (ex.: sync entre dispositivos), reavaliar com:

1. Opt-in explícito (nunca obrigatório)
2. Criptografia / mínimo de dados
3. README e UI atualizados — a promessa “nada do currículo vai para servidor” deixaria de ser absoluta e precisaria ser reescrita com honestidade

Até lá, **sync na nuvem permanece fora do roadmap ativo**.

---

## Como usar este arquivo

- Issues e PRs de produto devem referenciar itens daqui
- O [README](README.md) resume o que o app faz hoje; o planejamento vive neste arquivo
