# Contribuindo

Obrigado por considerar contribuir com o **ATS Resume Builder**.

## Código de conduta

Ao participar, você concorda com o [Código de Conduta](CODE_OF_CONDUCT.md).

## Escopo do MVP

Hoje o produto gera currículo ATS apenas no **foco Geral**.

- Nichos (Full Stack, IA, etc.) e revisão com IA estão no roadmap — **abra uma issue/Discussion antes** de um PR grande nessas frentes.
- Preferimos PRs pequenos e focados.

## Como rodar localmente

Requisitos: Node.js 20+.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
```

## Fluxo de contribuição

A branch `main` é protegida: **não há push direto**. Use fork + PR.

1. Fork do repositório
2. Crie uma branch a partir de `main` (`feat/...`, `fix/...`, `docs/...`)
3. Faça commits curtos e claros
4. Abra um Pull Request descrevendo o que mudou e como testar
5. Aguarde CI verde e review

## Commits

Mensagens curtas, no estilo:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`

## Checklist do PR

- [ ] `npm run lint` e `npm run build` passam
- [ ] Escopo alinhado ao MVP (ou issue discutida antes)
- [ ] UI: descrição + como testar (screenshot se fizer sentido)
- [ ] Sem secrets, `.env` ou dados pessoais reais

## Segurança

Vulnerabilidades: veja [SECURITY.md](SECURITY.md) — **não** abra issue pública.

## Observação futura

O endpoint `POST /api/pdf` ainda não tem rate limit. Mudanças nessa área devem considerar abuso/carga.

## Dúvidas

Use [Discussions](https://github.com/gr-silva/ats-resume-builder/discussions) para ideias. Issues para bugs e tarefas concretas.
