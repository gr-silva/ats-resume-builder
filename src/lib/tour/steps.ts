import type { DriveStep, Side } from "driver.js";
import type { FormTabId } from "@/lib/resume/form-progress";
import type { PassaruPose } from "@/lib/tour/poses";

export type TourStepDef = {
  id: string;
  element: string | (() => Element);
  pose: PassaruPose;
  title: string;
  description: string;
  tab?: FormTabId;
  optional?: boolean;
  side?: Side;
};

export const REQUIRED_TOUR_IDS = [
  "hero",
  "start",
  "demo",
  "reset",
  "replay",
  "privacy",
  "progress",
  "form-tabs",
  "tab-dados",
  "tab-resumo",
  "tab-skills",
  "tab-experiencia",
  "exp-actions",
  "tab-formacao",
  "tab-extra",
  "preview",
  "export",
  "ai-setup",
] as const;

export const OPTIONAL_TOUR_IDS = [
  "wizard",
  "ai-hint",
  "import",
  "star-ai",
] as const;

function selector(id: string): string {
  return `[data-tour="${id}"]`;
}

function visibleExportTarget(): Element {
  const desktop = document.querySelector(selector("export-desktop"));
  const mobile = document.querySelector(selector("export-mobile"));
  if (desktop instanceof HTMLElement && desktop.getClientRects().length > 0) {
    return desktop;
  }
  if (mobile instanceof HTMLElement && mobile.getClientRects().length > 0) {
    return mobile;
  }
  return desktop ?? mobile ?? document.body;
}

export const TOUR_STEPS: TourStepDef[] = [
  {
    id: "hero",
    element: selector("hero"),
    pose: "wave",
    title: "Oi, eu sou o Passaru!",
    description:
      "Bem-vindo ao Passou. Aqui você monta um currículo que passa na triagem (ATS), em Markdown e PDF, sem criar conta.",
    side: "bottom",
  },
  {
    id: "start",
    element: selector("start"),
    pose: "point",
    title: "Comece por aqui",
    description:
      "O botão Começar leva você ao formulário, na primeira seção que ainda estiver vazia.",
    side: "bottom",
  },
  {
    id: "demo",
    element: selector("demo"),
    pose: "show",
    title: "Quer ver um exemplo?",
    description:
      "Carregar demo preenche um currículo fictício para você ver o preview. Dá para desfazer em seguida.",
    side: "bottom",
  },
  {
    id: "reset",
    element: selector("reset"),
    pose: "think",
    title: "Limpar o rascunho",
    description:
      "Limpar apaga o que está salvo neste navegador. O Passou pede confirmação e ainda oferece desfazer.",
    side: "bottom",
  },
  {
    id: "wizard",
    element: selector("wizard"),
    pose: "show",
    title: "Assistente IA (opcional)",
    description:
      "No Chrome, o assistente faz perguntas curtas e preenche o formulário por você. Tudo roda neste computador.",
    optional: true,
    side: "bottom",
  },
  {
    id: "ai-hint",
    element: selector("ai-hint"),
    pose: "show",
    title: "IA só no Chrome",
    description:
      "O formulário já funciona neste navegador. A IA local é um extra no Chrome desktop — toque em Saiba mais se quiser os detalhes.",
    optional: true,
    side: "bottom",
  },
  {
    id: "import",
    element: selector("import"),
    pose: "show",
    title: "Importar um currículo",
    description:
      "Cole o texto (ou envie .txt / .md) e a IA extrai os campos. O arquivo original não sai do seu Chrome.",
    optional: true,
    side: "bottom",
  },
  {
    id: "replay",
    element: selector("replay"),
    pose: "wave",
    title: "Reabra o tour quando quiser",
    description:
      "Depois desta visita, é só clicar em Tour para eu te guiar de novo.",
    side: "bottom",
  },
  {
    id: "privacy",
    element: selector("privacy"),
    pose: "think",
    title: "Seus dados ficam aqui",
    description:
      "O rascunho vive no navegador. Analytics só conta visitas — o texto do currículo não é enviado nem analisado.",
    side: "bottom",
  },
  {
    id: "progress",
    element: selector("progress"),
    pose: "think",
    title: "Acompanhe o preenchimento",
    description:
      "O contador N/6 mostra quantas seções já estão prontas. Uma dica aparece quando a aba atual ainda está vazia.",
    side: "bottom",
  },
  {
    id: "form-tabs",
    element: selector("form-tabs"),
    pose: "point",
    title: "Seis seções, no seu ritmo",
    description:
      "Dados, Resumo, Skills, Experiência, Formação e Extra. Os pontinhos mostram o que já foi preenchido.",
    side: "bottom",
  },
  {
    id: "tab-dados",
    element: selector("tab-dados"),
    pose: "show",
    title: "Comece pelos seus dados",
    description:
      "Nome, cargo-alvo e contatos. O preview do currículo atualiza ao lado enquanto você digita.",
    tab: "dados",
    side: "right",
  },
  {
    id: "tab-resumo",
    element: selector("tab-resumo"),
    pose: "think",
    title: "Um resumo que fala com o ATS",
    description:
      "3 a 4 linhas densas: áreas, experiência e um resultado concreto. Cite ferramentas pelo nome.",
    tab: "resumo",
    side: "right",
  },
  {
    id: "tab-skills",
    element: selector("tab-skills"),
    pose: "point",
    title: "Skills em tags",
    description:
      "Digite e aperte Enter ou vírgula para virar chip. Dá para agrupar em categorias e adicionar ou remover grupos.",
    tab: "skills",
    side: "right",
  },
  {
    id: "tab-experiencia",
    element: selector("tab-experiencia"),
    pose: "think",
    title: "Experiência é o que mais pesa",
    description:
      "Cargo, empresa e bullets. Abra “Como escrever um bom bullet” para o caminho Situação → Tarefa → Ação → Resultado.",
    tab: "experiencia",
    side: "left",
  },
  {
    id: "exp-actions",
    element: selector("exp-actions"),
    pose: "point",
    title: "Organize as experiências",
    description:
      "Suba, desça ou remova um bloco. Use + Bullet e + Experiência para ir acrescentando.",
    tab: "experiencia",
    side: "left",
  },
  {
    id: "star-ai",
    element: selector("star-ai"),
    pose: "show",
    title: "Revisar bullets com IA",
    description:
      "Melhorar todos (ou o ícone em cada bullet) reescreve no formato STAR. A IA pergunta o que faltar antes de alterar o texto.",
    tab: "experiencia",
    optional: true,
    side: "left",
  },
  {
    id: "tab-formacao",
    element: selector("tab-formacao"),
    pose: "show",
    title: "Formação",
    description:
      "Curso, instituição e período. Reordene, remova ou adicione outra formação com os botões do bloco.",
    tab: "formacao",
    side: "right",
  },
  {
    id: "tab-extra",
    element: selector("tab-extra"),
    pose: "show",
    title: "Extra: cursos, idiomas e disponibilidade",
    description:
      "Certificações, idiomas e como você pode trabalhar. Os botões + e a lixeira incluem ou removem itens.",
    tab: "extra",
    side: "right",
  },
  {
    id: "preview",
    element: selector("preview"),
    pose: "read",
    title: "Veja o currículo nascer",
    description:
      "Alterne PDF e Markdown. O PDF é uma aproximação visual; o arquivo baixado é o ATS de verdade.",
    side: "left",
  },
  {
    id: "export",
    element: visibleExportTarget,
    pose: "yay",
    title: "Baixe quando estiver bom",
    description:
      "MD e PDF ficam no aside (computador) ou nesta barra (celular). Se o currículo estiver quase vazio, o Passou avisa antes.",
    side: "top",
  },
  {
    id: "ai-setup",
    element: selector("ai-setup"),
    pose: "think",
    title: "IA é extra, não requisito",
    description:
      "Este painel explica o Chrome / Gemini Nano. Se aparecer Preparar IA, é só o download único do modelo neste computador.",
    side: "left",
  },
];

export function toDriverSteps(
  onFormTab: (tab: FormTabId) => void,
  options: { aiSupported: boolean } = { aiSupported: false }
): DriveStep[] {
  return TOUR_STEPS.filter((step) => {
    if (step.id === "wizard" || step.id === "import" || step.id === "star-ai") {
      return options.aiSupported;
    }
    if (step.id === "ai-hint") return !options.aiSupported;
    return true;
  }).map((step) => ({
    element: step.element,
    skipMissingElement: Boolean(step.optional),
    waitForElement: step.tab ? (step.optional ? 250 : 800) : undefined,
    disableActiveInteraction: true,
    onHighlightStarted: () => {
      if (step.tab) onFormTab(step.tab);
    },
    popover: {
      title: step.title,
      description: step.description,
      side: step.side,
      align: "center",
    },
    data: { id: step.id, pose: step.pose, tab: step.tab },
  }));
}
