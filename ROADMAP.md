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
- [x] Caminho sem IA — fluxo principal (formulário + MD/PDF) claro em qualquer navegador; CTAs e mobile revisados

---

## Próximo (prioridade)

Ordenado pelo impacto no caminho que **a maioria** usa (formulário → exportar), não só quem tem Chrome + hardware para IA.

### 1. Fechar valor de exportação

- [ ] Export DOCX (ATS-friendly)
- [ ] Textos prontos para LinkedIn (sobre / experiências), gerados a partir do rascunho local — sem envio a servidor além do necessário para gerar o arquivo

### 2. Nichos (Full Stack, IA, …)

Hoje existem stubs e badges “em breve” na UI.

- [ ] Ativar seleção de nicho de forma útil (reordenar/ênfase de skills e experiências) **ou**
- [ ] Remover/suavizar badges “em breve” até o recurso existir — evitar promessa vazia

### 3. Qualidade da IA local (Chrome)

- [ ] Continuar polindo prompts STAR (preservar conteúdo, aplicar sugestões sem inventar métricas)
- [ ] Troubleshooting / onboarding mais claros para download do modelo e hardware mínimo
- [ ] Avaliar eventos de analytics **só de produto** (ex.: abriu wizard) com disclosure explícito — sem texto do currículo (opcional; só se a privacidade continuar clara)

### 4. Apoio ao projeto (open source)

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
