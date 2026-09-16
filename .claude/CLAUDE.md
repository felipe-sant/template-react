# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto

Template base de frontend React + TypeScript, usado como ponto de partida para novos projetos.
Ainda está em construção e **não** está estruturado de forma definitiva. A migração de Create
React App (`react-scripts`) para **Vite** já foi feita: o toolchain de dev server, build e teste
é Vite + Vitest.

Os textos de UI e o conteúdo de documentação (`README.md`, specs, mensagens de commit, descrição
de PR) estão em **português**. Mantenha esse padrão. **Identificadores no código são em inglês** —
ver "Estilo de código".

## Comandos

```bash
npm run dev      # dev server do Vite (porta padrão 5173)
npm run build    # checagem de tipos (tsc --noEmit) + build de produção em dist/
npm run preview  # serve o conteúdo de dist/ já gerado — depende de um npm run build anterior
npm test         # Vitest em watch mode (o script é `vitest`, sem `run`)
npm test -- --run                            # execução one-shot (CI, agente, terminal não-interativo)
npm test -- --run src/pages/Home.page.test.tsx   # um arquivo específico
npx tsc --noEmit # checagem de tipos isolada
```

Não existe script de lint — não há ESLint configurado no projeto.

O teste é **co-localizado**: `<arquivo>.test.tsx` ao lado do arquivo testado
(`src/pages/Home.page.test.tsx`, `src/routers/Router.test.tsx`, `src/components/Button.test.tsx`),
nunca em `__tests__/` nem com sufixo `.spec.tsx`. O ambiente é `jsdom` e o setup é
`src/setupTests.ts`, registrado em `test.setupFiles` do `vite.config.ts` — é ele que importa
`@testing-library/jest-dom/vitest` (registrando matchers como `toBeInTheDocument()`) e que roda
`afterEach(cleanup)`, porque sem `globals: true` o Testing Library não liga o cleanup sozinho.
Os três testes existentes servem de modelo: render direto da página, árvore de rotas (`AppRoutes`)
sob `MemoryRouter` para verificar a rota `*`, e componente com interação (clique disparando
`onClick`). A skill `vitest-specialist` documenta o resto.

`vite build` sozinho não checa tipos (usa esbuild, que só transpila); por isso o script `build`
roda `tsc --noEmit` antes.

## Arquitetura

Fluxo de render: `src/index.tsx` (createRoot + StrictMode) → `src/App.tsx` → `src/routers/Router.tsx` → páginas.

- **`App.tsx`** define os metadados padrão do site (`react-helmet`) e importa o `global.css`.
  Páginas que precisam de título próprio declaram o próprio `<Helmet>`, que sobrescreve o do App
  (ver `NotFound.page.tsx`).
- **`src/routers/Router.tsx`** — ponto único de registro de rotas (`BrowserRouter`). `Routes` é
  importado com alias `Switch`. A rota `*` cai em `NotFound`. Toda página nova entra aqui. O
  arquivo exporta `AppRoutes` (só as `<Route>`) separado do `Router` (export default, que envolve
  `AppRoutes` com `BrowserRouter`) — é `AppRoutes` que o teste renderiza sob `MemoryRouter`.
- **`src/pages/`** — convenção de nome `Nome.page.tsx`, componente `function NomePage()` com
  `export default`.
- **`src/styles/`** — `global.css` guarda os CSS custom properties (escala de cinza `--g1-color`
  … `--g10-color`, `--roboto-font`) e o reset. Estilos de página ficam em
  `src/styles/pages/<nome>.module.css` (CSS Modules), importados como `import css from "..."`.
  A tipagem dos módulos vem de `src/types/declarations.d.ts`.
- **Alias de import `@/`** — `@/*` resolve para `src/*`. Configurado em dois lugares que precisam
  continuar concordando: `paths` no `tsconfig.json` (para o `tsc` e o editor) e `resolve.alias` no
  `vite.config.ts` (para o dev server e o build). Mexer em um sem o outro deixa o `tsc --noEmit`
  verde e quebra o build, ou vice-versa. O Vitest herda o alias do mesmo `vite.config.ts`.

Não há camada de estado global nem cliente HTTP configurados. A convenção de variáveis de
ambiente é a do Vite: só variáveis com prefixo `VITE_`
são expostas ao código do cliente, e a leitura é `import.meta.env.VITE_ALGO` — não
`process.env.REACT_APP_ALGO`, que era a convenção do Create React App e não existe mais aqui.

A configuração de build fica em `vite.config.ts` na raiz (plugin React + bloco `test` do Vitest),
e a entrada da aplicação é o `index.html` da raiz, que carrega `/src/index.tsx` como módulo.

## Estilo de código

**Todo identificador é em inglês.** Nome de componente, função, método, variável, propriedade,
atributo, interface/tipo, hook, arquivo e classe de CSS Module — tudo em inglês, sem mistura
(`name`/`active`, nunca `nome`/`ativo`; `isLoading`, nunca `estaCarregando`).

O que **continua em português** é o texto que o usuário lê: conteúdo de JSX, `label`, `placeholder`,
`title`/`meta` do `react-helmet`, mensagem de `Error` e string literal de UI em geral. A regra separa
a linguagem do código da linguagem do produto — `<Button label="Botão de exemplo" />` está correto:
`Button` e `label` em inglês, o texto visível em português.

**Não escreva comentários no código.** Um bom código se explica sozinho: se um trecho só fica
compreensível com um comentário, o problema é o trecho — renomeie a variável/função, extraia uma
função com nome descritivo ou simplifique a lógica, em vez de comentar. Isso vale para `//`, `/* */`
e `{/* */}` em JSX.

O contexto que não cabe no código vai para onde ele é procurado de verdade: `README.md` (como usar),
a descrição do PR (por que mudou), o `spec.md` da feature em `.docs/` (decisões de projeto) e a
mensagem de commit (o que mudou naquele passo). Ao remover um comentário que carregava informação
útil, mova essa informação para um desses lugares — não a descarte.

Exceções, quando realmente necessárias: diretivas exigidas por ferramenta (`@ts-expect-error`,
`eslint-disable`, pragmas de build) e o cabeçalho de licença de terceiros. Nenhuma delas é
comentário explicativo.

### Imports

Três regras. A primeira é sobre onde o módulo está; as duas seguintes, sobre reduzir a quantidade
de JavaScript no arquivo buildado — e nenhuma dessas duas reduz o `node_modules`, cujo tamanho
depende só do `package.json` e das dependências transitivas instaladas, não da forma como o código
importa.

**Import interno usa o alias `@/`, nunca `../`.** Um import que sobe de pasta (`../`,
`../../`) é frágil: quebra ao mover o arquivo de lugar. Use `@/styles/pages/home.module.css` em
vez de `../styles/pages/home.module.css`. Import para a mesma pasta ou descendo a partir da
própria localização (`./routers/Router` em `src/App.tsx`) continua válido — o problema é subir,
não descer. Imports de pacote (`react`, `react-router-dom`) não são afetados.

**Import nomeado, nunca import de namespace.** Importe só o que for usado — prefira

```ts
import { StrictMode } from "react";
```

a

```ts
import * as React from "react";
```

A primeira forma permite tree-shaking: o Rollup (via Vite) descarta do bundle o que não foi
referenciado. O namespace obriga o bundler a manter o módulo inteiro, porque qualquer propriedade
pode ser acessada em tempo de execução.

**Subpath import quando o pacote publicar.** Importe pelo caminho específico — prefira

```ts
import debounce from "lodash/debounce";
```

a

```ts
import { debounce } from "lodash";
```

O ganho aparece em pacotes que publicam um arquivo por função/módulo (`lodash`, `date-fns`) ou por
grupo (bibliotecas de ícones, ex. `react-icons/fi`), onde importar do índice arrasta o pacote
inteiro. Limites: nem todo pacote expõe subpaths — muitos restringem o que é acessível pelo campo
`exports` do `package.json`, e importar um caminho não declarado quebra o build, então confira o
que o pacote publica em vez de presumir. Não se aplica ao React, que só expõe `react` e
`react/jsx-runtime`: não existe subpath por hook porque `useState` não é um módulo isolado, é uma
chamada ao dispatcher interno do runtime. E pacotes ESM com bom tree-shaking (`lodash-es`,
`date-fns` v3) já resolvem isso pela primeira regra — subpath é a saída para pacotes CJS ou mal
empacotados.

## Pontos conhecidos em aberto

- Não há favicon: o `index.html` da raiz não referencia nenhum ícone e não existe `public/`, então
  o navegador pede `/favicon.ico` e recebe 404 (issue #2). As referências mortas a
  `manifest.json`/`logo192.png` já foram removidas junto com o `public/index.html` do CRA.
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
- `.claude/skills/` — conhecimento carregável sob demanda. São três, separadas pela pasta do
  artefato: `react-page-scaffold` (página em `src/pages/` + CSS Module + registro de rota),
  `react-component-scaffold` (componente reutilizável em `src/components/` + CSS Module em
  `src/styles/components/`) e `vitest-specialist` (teste co-localizado com Vitest + Testing
  Library, `src/setupTests.ts` e o bloco `test` do `vite.config.ts`).
- `.docs/` — specs por feature/bug (`.docs/features/<slug>/`, `.docs/bugs/<slug>/`), a partir de
  `.docs/_template/`. As pastas de spec são gitignored: planejamento local, fora do histórico.
  O estado vive no campo `**Status:**` do `spec.md` (`rascunho` → `em-revisao` → `aprovada` →
  `em-andamento` → `implementada`); só humano promove para `aprovada`.

Ao mudar uma convenção deste arquivo, verifique se algum agente ou skill a repete — eles citam
este `CLAUDE.md` como fonte da verdade, mas duplicam os pontos que precisam aplicar sozinhos.
