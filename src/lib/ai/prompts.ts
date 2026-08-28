import type { WizardAnswers } from "@/lib/ai/types";

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
  invalidResponse: string
): string {
  return `${originalPrompt}

A resposta anterior não era JSON válido ou não seguia o schema. Corrija e retorne apenas JSON válido.

Resposta inválida:
${invalidResponse.slice(0, 2000)}`;
}
