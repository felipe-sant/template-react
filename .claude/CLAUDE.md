# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto

Template base de frontend React + TypeScript, usado como ponto de partida para novos projetos.
Ainda está em construção e **não** está estruturado de forma definitiva — há uma migração
planejada de Create React App (`react-scripts`) para **Vite**.

Código, comentários e textos de UI estão em **português**. Mantenha esse padrão.

## Comandos

```bash
npm run dev      # servidor de desenvolvimento (react-scripts start, porta 3000)
npm run build    # build de produção em build/
npm start        # serve o build estático já gerado (serve -s build) — NÃO é o dev server
npm test         # Jest + React Testing Library em watch mode (react-scripts test)
npm test -- --watchAll=false                      # roda uma vez (CI)
npm test -- --watchAll=false src/pages/Home.test.tsx   # um arquivo específico
npx tsc --noEmit # checagem de tipos isolada
```

Não existe script de lint. O ESLint só roda embutido no `react-scripts` (config `react-app`
dentro do `package.json`). Ainda não há nenhum teste escrito no repositório.

`npm start` depende de um `npm run build` anterior; sem ele o comando falha.

## Arquitetura

Fluxo de render: `src/index.tsx` (createRoot + StrictMode) → `src/App.tsx` → `src/routers/Router.tsx` → páginas.

- **`App.tsx`** define os metadados padrão do site (`react-helmet`) e importa o `global.css`.
  Páginas que precisam de título próprio declaram o próprio `<Helmet>`, que sobrescreve o do App
  (ver `NotFound.page.tsx`).
- **`src/routers/Router.tsx`** — ponto único de registro de rotas (`BrowserRouter`). `Routes` é
  importado com alias `Switch`. A rota `*` cai em `NotFound`. Toda página nova entra aqui.
- **`src/pages/`** — convenção de nome `Nome.page.tsx`, componente `function NomePage()` com
  `export default`.
- **`src/styles/`** — `global.css` guarda os CSS custom properties (escala de cinza `--g1-color`
  … `--g10-color`, `--roboto-font`) e o reset. Estilos de página ficam em
  `src/styles/pages/<nome>.module.css` (CSS Modules), importados como `import css from "..."`.
  A tipagem dos módulos vem de `src/declarations.d.ts`.

Não há camada de estado global, cliente HTTP, alias de import (`@/`) nem variáveis de ambiente
configuradas. Ao adicionar qualquer uma dessas coisas, considere que a migração para Vite está
prevista e evite acoplar a soluções específicas do `react-scripts`.

## Pontos conhecidos em aberto

- `public/` só tem `index.html`, mas ele referencia `manifest.json`, `favicon.ico` e `logo192.png`
  que não existem — geram 404 em runtime.
- A fonte Roboto é referenciada no CSS mas nunca carregada.
- `src/styles/pages/home.module.css` está vazio, embora `Home.page.tsx` use `css.main`.
- `tsconfig.json` ainda tem `target: es5` e TypeScript 4.9 com React 19.

## Padrão de branches, commits e PRs

Toda branch, commit e PR segue o padrão de `CONTRIBUTING.md`: branches como
`<tipo>/<número-da-issue>-<descrição-curta>` (ex.: `feat/21-agentes-e-skills`) e commits como
`<Tipo> <ícone> [#<número-da-issue>] <descrição>` (ex.: `Fix :bug: [#5] ...`), com o `<Tipo>`
vindo da tabela daquele arquivo (Fix, Feat, Hotfix, Refactor, Test, Perf, Style, Docs, Build,
Chore, Revert) — nunca uma label do GitHub (`enhancement`, etc.) no lugar do tipo. A descrição do
PR segue a estrutura de `.github/PULL_REQUEST_TEMPLATE.md`, não um corpo livre.

## Tooling de IA (agents, skills e spec-driven)

- `.claude/agents/` — três papéis que formam o fluxo planejar → aprovar → executar → revisar:
  `sdd` (só planeja, escreve `spec.md`/`tasks.md` em `.docs/`, nunca toca em `src/`), `executor`
  (implementa um `tasks.md` já aprovado, em branch dedicada, com commits atômicos) e `reviewer`
  (audita o resultado contra este arquivo, somente leitura).
- `.claude/skills/` — conhecimento carregável sob demanda. Hoje só `react-page-scaffold`, o passo
  a passo de criar página. As skills de componente e de testes ficam para depois de #10 e #19.
- `.docs/` — specs por feature/bug (`.docs/features/<slug>/`, `.docs/bugs/<slug>/`), a partir de
  `.docs/_template/`. As pastas de spec são gitignored: planejamento local, fora do histórico.
  O estado vive no campo `**Status:**` do `spec.md` (`rascunho` → `em-revisao` → `aprovada` →
  `em-andamento` → `implementada`); só humano promove para `aprovada`.

Ao mudar uma convenção deste arquivo, verifique se algum agente ou skill a repete — eles citam
este `CLAUDE.md` como fonte da verdade, mas duplicam os pontos que precisam aplicar sozinhos.
