import { cryptoRandomId, type ResumeData } from "@/lib/resume/schema";

/** Fictional demo data for local preview — not a real person. */
export function createDemoResume(): ResumeData {
  return {
    name: "Alex Rivera",
    targetRole: "Software Engineer | Full Stack, IA e Automação",
    location: "São Paulo, SP",
    phone: "+55 (11) 90000-0000",
    email: "alex.rivera.demo@example.com",
    linkedin: "linkedin.com/in/alex-rivera-demo",
    portfolio: "alexrivera.demo.dev",
    summary:
      "Software Engineer com mais de 5 anos de experiência em desenvolvimento Full Stack e automação de processos. Atua com TypeScript, Node.js, React e cloud na construção de produtos digitais e integrações. Destaques: modernização de plataforma legada entregue em 3 meses e automações que reduziram em 40% o esforço manual em rotinas de backoffice.",
    skillCategories: [
      {
        id: cryptoRandomId(),
        name: "Linguagens",
        items: "TypeScript, JavaScript, Python",
      },
      {
        id: cryptoRandomId(),
        name: "Front-end",
        items: "React, Next.js",
      },
      {
        id: cryptoRandomId(),
        name: "Back-end e Cloud",
        items: "Node.js, REST APIs, AWS",
      },
      {
        id: cryptoRandomId(),
        name: "Práticas",
        items: "CI/CD, observabilidade, integrações de sistemas",
      },
    ],
    experiences: [
      {
        id: cryptoRandomId(),
        title: "Software Engineer",
        company: "Demo Corp",
        period: "Jan/2023 – Presente",
        bullets: [
          "Liderei a modernização full stack de plataforma legada com TypeScript, Node.js e React, entregue em aproximadamente 3 meses, elevando estabilidade e velocidade de entrega.",
          "Desenvolvi automações de processos de backoffice integradas aos sistemas existentes, reduzindo em 40% o esforço manual em rotinas selecionadas.",
          "Criei dashboards de monitoramento em tempo real, antecipando falhas antes do impacto no cliente e reduzindo o tempo de diagnóstico da equipe de suporte.",
        ],
      },
      {
        id: cryptoRandomId(),
        title: "Desenvolvedor Full Stack",
        company: "Startup Exemplo",
        period: "Mar/2020 – Dez/2022",
        bullets: [
          "Construí aplicações web com Node.js e React para produtos B2B, do discovery à implantação em produção.",
          "Implementei integrações REST com sistemas de terceiros, padronizando fluxos de onboarding de novos clientes.",
        ],
      },
    ],
    education: [
      {
        id: cryptoRandomId(),
        degree: "Bacharelado em Ciência da Computação",
        institution: "Universidade Exemplo",
        period: "2016 – 2019",
      },
    ],
    courses: [
      {
        id: cryptoRandomId(),
        text: "Formação React / Next.js — plataforma de cursos (demo)",
      },
    ],
    languages: [
      { id: cryptoRandomId(), name: "Português", level: "Nativo" },
      { id: cryptoRandomId(), name: "Inglês", level: "Intermediário" },
    ],
    availability: "Remoto; híbrido ou presencial. Início sob acordo.",
    focus: "geral",
  };
}
