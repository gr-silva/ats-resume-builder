import type { WizardAnswers } from "@/lib/ai/types";
import type {
  StarExperienceContext,
  StarUserAnswer,
} from "@/lib/ai/star-types";

const SYSTEM_PROMPT = `Você é um assistente especializado em currículos ATS em português do Brasil.
Gere JSON válido conforme o schema fornecido. Regras:
- Bullets de experiência no formato STAR comprimido: contexto + ação/tecnologia + resultado mensurável.
- Skills: categorias com itens separados por vírgula.
- Use strings vazias para campos desconhecidos; arrays vazios se não houver dados.
- Não invente empresas, datas ou métricas sem base nas informações fornecidas.
- Responda apenas com JSON, sem markdown nem texto extra.`;

export function buildWizardPrompt(answers: WizardAnswers): string {
  return `${SYSTEM_PROMPT}

Com base nas respostas abaixo, preencha um currículo ATS completo.

Nome e cargo-alvo:
${answers.nameAndRole}

Localização e contatos (email, LinkedIn, telefone, portfólio — opcionais):
${answers.locationAndContacts}

Resumo da carreira:
${answers.careerSummary}

Última(s) experiência(s) e conquistas:
${answers.lastExperience}

Formação e skills principais:
${answers.educationAndSkills}`;
}

export function buildImportPrompt(resumeText: string): string {
  return `${SYSTEM_PROMPT}

Extraia os dados do currículo abaixo e preencha o JSON do schema.
Se alguma seção não existir no texto, use string vazia ou array vazio.

--- CURRÍCULO ---
${resumeText}
--- FIM ---`;
}

export function buildRetryPrompt(
  originalPrompt: string,
  invalidResponse: string,
  validationError?: string
): string {
  const errorLine = validationError
    ? `Erro de validação: ${validationError}`
    : "A resposta anterior não era JSON válido ou não seguia o schema.";

  return `${originalPrompt}

${errorLine}
Corrija e retorne apenas JSON válido, sem markdown nem texto extra.

Resposta inválida:
${invalidResponse.slice(0, 2000)}`;
}

const STAR_SYSTEM_PROMPT = `Você é um especialista em currículos ATS e método STAR (Situation, Task, Action, Result) em português do Brasil.
Gere JSON válido conforme o schema fornecido. Regras:
- STAR comprimido: bullets finais em UMA frase (contexto + ação/tecnologia + resultado mensurável).
- Analise cada componente STAR: situation (contexto/desafio), task (responsabilidade/objetivo), action (o que fez/tecnologias), result (impacto mensurável).
- status "clear": componente explícito ou inferível com alta confiança do contexto.
- status "partial": componente implícito ou incompleto.
- status "missing": componente ausente ou indetectável.
- Se status for "partial" ou "missing", inclua em "questions" uma pergunta objetiva em PT-BR para o usuário preencher a lacuna.
- "suggestions": array de objetos com "issue" (diagnóstico curto do que falta ou está fraco) e "idea" (sugestão acionável: tipo de métrica aplicável ao contexto — tempo, volume, %, custo, NPS — ou frase modelo para inspirar o ajuste, SEM números ou percentuais fictícios).
- Exemplo de idea: "Considere citar redução de tempo de deploy ou volume de tickets resolvidos por sprint".
- NÃO invente métricas, empresas, datas ou tecnologias sem base no texto ou nas respostas do usuário.
- Responda apenas com JSON, sem markdown nem texto extra.`;

function formatExperienceContext(context: StarExperienceContext): string {
  return `Cargo: ${context.title || "(não informado)"}
Empresa: ${context.company || "(não informado)"}
Período: ${context.period || "(não informado)"}`;
}

function formatBulletsList(bullets: string[]): string {
  return bullets
    .map((b, i) => `${i}. ${b.trim() || "(vazio)"}`)
    .join("\n");
}

export function buildStarAnalyzeBulletPrompt(
  context: StarExperienceContext,
  bullet: string,
  bulletIndex: number
): string {
  return `${STAR_SYSTEM_PROMPT}

Analise o bullet abaixo quanto ao método STAR. Retorne análise para bulletIndex ${bulletIndex}.

Contexto da experiência:
${formatExperienceContext(context)}

Bullet (${bulletIndex}):
${bullet.trim() || "(vazio)"}`;
}

export function buildStarAnalyzeExperiencePrompt(
  context: StarExperienceContext,
  bullets: string[]
): string {
  const indices = bullets
    .map((b, i) => (b.trim() ? i : -1))
    .filter((i) => i >= 0);

  return `${STAR_SYSTEM_PROMPT}

Analise TODOS os bullets abaixo quanto ao método STAR. Retorne um item por bullet analisado.
Analise apenas bullets não vazios. Use bulletIndex correspondente ao índice original.

Contexto da experiência:
${formatExperienceContext(context)}

Bullets (índice. texto):
${formatBulletsList(bullets)}

Índices a analisar: ${indices.join(", ") || "nenhum"}`;
}

export function buildStarRewritePrompt(
  context: StarExperienceContext,
  items: Array<{ bulletIndex: number; original: string }>,
  userAnswers?: StarUserAnswer[]
): string {
  const bulletsBlock = items
    .map((item) => `[${item.bulletIndex}] ${item.original.trim() || "(vazio)"}`)
    .join("\n");

  const answersBlock =
    userAnswers && userAnswers.length
      ? `\nRespostas do usuário para lacunas STAR:\n${userAnswers
          .map((a) => {
            const skip = a.skipped ? " (pulado)" : "";
            return `- Bullet ${a.bulletIndex}, ${a.component}${skip}: ${a.answer.trim() || "(sem resposta)"}`;
          })
          .join("\n")}`
      : "";

  return `${STAR_SYSTEM_PROMPT}

Reescreva os bullets abaixo em formato STAR comprimido (uma frase ATS-friendly).
Use as respostas do usuário quando fornecidas. Não invente dados.

Contexto da experiência:
${formatExperienceContext(context)}

Bullets originais:
${bulletsBlock}${answersBlock}

Retorne "rewrites" com bulletIndex, original, rewritten e breakdown (situation, task, action, result).`;
}
