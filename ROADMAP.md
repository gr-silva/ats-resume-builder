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

### Caminho sem IA (maioria dos usuários)

- [x] Deixar óbvio que o fluxo principal (preencher + MD/PDF) funciona em qualquer navegador
- [x] Mensagens/UX quando a IA estiver indisponível (sem parecer que o app “não funciona”)
- [x] Revisar hierarquia de CTAs no header (Começar / formulário vs Assistente / Importar)
- [x] Melhorias de layout e usabilidade em mobile (tabs, bullets, preview)

---

## Próximo (prioridade)

Ordenado pelo impacto no caminho que **a maioria** usa (formulário → exportar), não só quem tem Chrome + hardware para IA.

### 1. Fechar valor de exportação

- [ ] Export DOCX (ATS-friendly)
- [ ] Textos prontos para LinkedIn (sobre / experiências), gerados a partir do rascunho local — sem envio a servidor além do necessário para gerar o arquivo
- [x] **Preview do PDF** (ou render próximo do PDF) antes do download — aside com tabs PDF | Markdown; preview HTML a partir dos mesmos blocks do PDFKit
- [x] Aviso suave ao exportar currículo quase vazio (sem nome / sem experiência) — evita PDF inútil e sensação de “o app não funciona”
- [x] Feedback após download (toast / estado “PDF baixado” / “Markdown baixado”)

### 2. Reduzir abandono no formulário (caminho majoritário)

Fricções que fazem o usuário desistir **antes** de exportar.

- [ ] Progresso / checklist de preenchimento (Dados → Resumo → Skills → Experiência…) — 6 tabs sem noção de “quanto falta” escondem o trabalho restante
- [ ] Empty state orientado no editor (1–2 frases + próximo passo), não só campos em branco; “Começar” hoje só rola a página
- [ ] Confirmação (ou undo) em **Limpar** e **Carregar demo** — um clique apaga o rascunho em `localStorage` sem volta
- [ ] CTAs de export (MD/PDF) acessíveis no mobile sem depender do aside sticky (só `lg+`) — no telefone o download fica longe do formulário
- [ ] Skills com UX de chips/tags (ou validação clara) em vez de só “itens separados por vírgula” — erro fácil de formatação e fricção desnecessária
- [ ] Reordenar experiências / formação (subir/descer) — cronologia errada é comum e hoje exige recriar blocos
- [ ] Suavizar jargão STAR na UI para quem não conhece o framework (dica curta expansível: Situação → Tarefa → Ação → Resultado) — sem isso a aba Experiência intimida
- [ ] Defaults de skills menos “só eng. de software” (Linguagens / Front-end / Back-end) **ou** labels neutros no foco Geral — categorias pré-preenchidas podem afastar outros perfis

### 3. Nichos (Full Stack, IA, …)

Hoje existem stubs e badges “em breve” na UI.

- [ ] Ativar seleção de nicho de forma útil (reordenar/ênfase de skills e experiências) **ou**
- [ ] Remover/suavizar badges “em breve” até o recurso existir — evitar promessa vazia
- [ ] Alinhar metadata / copy do layout (“nichos e IA em breve”) com o que o produto já faz — inconsistência gera desconfiança

### 4. Confiança no rascunho local-first

Sem conta na nuvem (ver [Conta na nuvem](#conta-na-nuvem--fora-do-escopo-ativo)); ainda assim o usuário precisa **acreditar** que não vai perder o trabalho.

- [ ] Sinalizar falha de persistência (modo privado / cota do `localStorage`) — hoje o write falha em silêncio
- [ ] Export/import do rascunho (JSON ou MD) como backup local — troca de browser/dispositivo sem sync na nuvem
- [ ] Ao aplicar Assistente / Importar, deixar explícito o que será substituído (experiências/skills inteiras) e oferecer desfazer — merge atual sobrescreve arrays e gera medo de perder texto já digitado

### 5. Qualidade da IA local (Chrome)

- [ ] Continuar polindo prompts STAR (preservar conteúdo, aplicar sugestões sem inventar métricas)
- [ ] Troubleshooting / onboarding mais claros para download do modelo e hardware mínimo
- [ ] Não usar links `chrome://…` clicáveis na web (não abrem a partir da página) — instruir a colar na barra de endereço
- [ ] Importar: reduzir fricção de PDF/DOCX (hoje só `.txt`/`.md` ou colar texto) — a maioria chega com PDF e abandona na barreira de “copie manualmente”
- [ ] Avaliar eventos de analytics **só de produto** (ex.: abriu wizard) com disclosure explícito — sem texto do currículo (opcional; só se a privacidade continuar clara)

### 6. Hierarquia visual e ruído na primeira tela

Itens que não quebram o fluxo, mas enfraquecem clareza e conversão na primeira visita.

- [ ] Reavaliar posição/peso do aviso de Analytics vs. CTA Começar — o bloco de privacidade compete com o valor (“preencher → PDF”) antes do usuário experimentar
- [ ] Painel “IA opcional” no aside: manter informativo, sem parecer pré-requisito do produto no mobile (onde aparece depois de um form longo)
- [ ] Erro e marca usam o mesmo vermelho (`accent`) — diferenciar estado de erro do CTA primário para não misturar “ação” com “falha”
- [ ] Considerar tema claro (ou preview do currículo em fundo claro) — currículo é documento de leitura; UI só dark pode parecer ferramenta de dev, não produto de emprego

### 7. Apoio ao projeto (open source)

Doação é opcional e **nunca** paywall.

- [ ] Link discreto “Apoiar o projeto” no README (GitHub Sponsors / Ko-fi / equivalente)
- [ ] Botão/CTA na UI **somente depois** de baseline estável de analytics (visitas recorrentes, não só pico de post) — preferir rodapé/aside, não competir com Começar / PDF

---

## Depois / sob demanda

- [ ] Melhorias de acessibilidade (foco, labels ligados aos inputs, contraste de `muted` no fundo preto, skip link)
- [ ] Mais templates ATS single-column (ainda locais)
- [ ] Internacionalização (EN) se houver demanda
- [ ] Wizard IA: permitir pular perguntas opcionais; revisão campo a campo antes de aplicar (não só preview monolítico)
- [ ] STAR review: enxugar passos / estados intermediários para menos carga cognitiva
- [ ] Contribuições comunitárias (`good first issue`) alinhadas a este roadmap

---

## UX/UI — hipóteses de abandono (referência)

Síntese da auditoria de produto (UI atual). Usar para priorizar issues; itens acionáveis estão em [Próximo](#próximo-prioridade) e [Depois](#depois--sob-demanda).

| Sinal | Por que o usuário pode sair |
| --- | --- |
| ~~Preview só em Markdown~~ (feito: tabs PDF \| Markdown) | Não “vê” o currículo final; PDF é caixa-preta |
| Tabs sem progresso | Formulário longo sem mapa mental; Experiência (valor ATS) fica escondida |
| Limpar / demo sem undo | Medo de perder rascunho → evita explorar |
| Mobile: PDF longe | Valor (download) abaixo de muito formulário |
| Badge “em breve” + copy desatualizada | Produto parece incompleto ou inconsistente |
| Import sem PDF nativo | Entrada natural bloqueada; IA vira obstáculo |
| `localStorage` silencioso | Descobre perda tarde demais; quebra confiança local-first |
| Jargão STAR + defaults eng. | Parece só para quem já “fala ATS/tech” |

Princípio: **mostrar valor em qualquer navegador em menos de 1 minuto** (preencher mínimo → ver resultado → baixar). IA e nichos só depois que esse caminho estiver óbvio e seguro.

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
