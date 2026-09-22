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
npm run lint      # oxlint sobre o projeto (configuração em .oxlintrc.json)
npm run lint:fix  # mesma coisa, aplicando as correções automáticas possíveis (oxlint --fix)
npm run format    # prettier --write em src/**/*.{ts,tsx} e vite.config.ts, conforme .prettierrc
npm run test:cov  # vitest run --coverage — suíte inteira + relatório de cobertura
```

O teste é **co-localizado**: `<arquivo>.test.tsx` ao lado do arquivo testado
(`src/pages/Home.page.test.tsx`, `src/components/Button.test.tsx`), nunca em `__tests__/` nem com
sufixo `.spec.tsx`. Use `.test.ts` (sem `x`) para o que não renderiza JSX — hook, util, service
(`src/hooks/useToggle.test.ts`, `src/utils/formatDate.test.ts`). O ambiente é `jsdom` e o setup é
`src/setupTests.ts`, registrado em `test.setupFiles` do `vite.config.ts` — é ele que importa
`@testing-library/jest-dom/vitest` (registrando matchers como `toBeInTheDocument()`) e que roda
`afterEach(cleanup)`, porque sem `globals: true` o Testing Library não liga o cleanup sozinho.
Os testes existentes servem de modelo para cada formato: render direto da página
(`Home.page.test.tsx`), árvore de rotas sob `MemoryRouter` para verificar a rota `*`
(`Router.test.tsx`), componente com interação (`Button.test.tsx`), hook com `renderHook`
(`useToggle.test.ts`), função pura (`formatDate.test.ts`), módulo com `fetch` stubado via
`vi.stubGlobal` (`http.service.test.ts`) e layout com `<Outlet />` preenchido por rota-filha
(`Main.layout.test.tsx`). A skill `vitest-specialist` documenta o resto.

Ficam sem teste `src/index.tsx`, que só chama `createRoot` num `#root` que não existe fora do
`index.html`, e `src/types/example.types.ts`, que só declara tipo e não tem runtime.

`npm run test:cov` roda a suíte inteira com `@vitest/coverage-v8` (bloco `test.coverage` em
`vite.config.ts`), gerando relatório nos formatos `text`, `json`, `json-summary` e `html` em
`coverage/` (gitignored) e aplicando um threshold mínimo de 80% em statements, branches, functions
e lines — abaixo disso o comando termina com erro. `exclude` cobre os arquivos sem runtime
relevante já citados acima, mais `vite.config.ts`, `src/setupTests.ts` e
`src/types/declarations.d.ts`.

`.github/workflows/ci.yml` roda em push para `main` e em todo Pull Request, com três jobs:
`build` (`npm run build`) e `lint` (`npm run lint`) sempre completos, e `test`, cujo escopo
depende do contexto — suíte completa + `npm run test:cov` (com o threshold de 80% acima) quando o
evento é push (sempre em `main`) ou o PR mira `main`, ou quando o diff toca um arquivo
"suite-wide" (`package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`,
`src/setupTests.ts`); nos demais PRs, roda só `vitest --changed` (sem coverage), cobrindo apenas
os testes afetados pelo diff. Em `mode=full`, o diretório `coverage/` é publicado como artifact do
workflow.

`vite build` sozinho não checa tipos (usa esbuild, que só transpila); por isso o script `build`
roda `tsc --noEmit` antes.

`npm install` configura automaticamente (script `prepare`, `"prepare": "husky"`) um hook de
`pre-commit` do Husky que roda `npx lint-staged` a cada commit — sem passo manual extra.
`lint-staged` (`.lintstagedrc.json`) aplica `oxlint --fix` e depois `prettier --write` só nos
arquivos `.ts`/`.tsx` staged, mesmo escopo dos scripts `lint:fix`/`format`; corrige o que for
automático e bloqueia o commit se sobrar erro de lint não corrigível sozinho. O `.editorconfig` na
raiz (`root = true`) padroniza charset, final de linha, quebra de linha final, remoção de trailing
whitespace e indentação (`indent_size = 2` por padrão, `4` para `*.ts`/`*.tsx`/`*.css`) para
editores compatíveis, coerente com o `.prettierrc` já existente.

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
  … `--g10-color`, `--sans-font`) e o reset. Estilos de página ficam em
  `src/styles/pages/<nome>.module.css` (CSS Modules), importados como `import css from "..."`.
  A tipagem dos módulos vem de `src/types/declarations.d.ts`.
- **Alias de import `@/`** — `@/*` resolve para `src/*`. Configurado em dois lugares que precisam
  continuar concordando: `paths` no `tsconfig.json` (para o `tsc` e o editor) e `resolve.alias` no
  `vite.config.ts` (para o dev server e o build). Mexer em um sem o outro deixa o `tsc --noEmit`
  verde e quebra o build, ou vice-versa. O Vitest herda o alias do mesmo `vite.config.ts`.
- **`public/`** — assets estáticos que o Vite copia como estão para a raiz de `dist/` no build, sem
  passar pelo bundler. Hoje contém só `favicon.svg`, referenciado em `index.html` via
  `<link rel="icon">`. O template não inclui `manifest.json` nem ícones de PWA por decisão de
  projeto: um manifest com `name`/ícones placeholder, sem produto definido, seria pior que não ter
  manifest — cada projeto derivado adiciona isso quando precisar.

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

### O que o oxlint verifica automaticamente

`npm run lint` (oxlint 1.85.0, configurado em `.oxlintrc.json`) cobre uma parte das convenções
acima mecanicamente; o restante continua sendo revisão manual do agente `reviewer`.

Verificado automaticamente pelo oxlint:

- `any` explícito → regra `typescript/no-explicit-any`, ligada individualmente como `error` — a
  categoria onde ela vive por padrão, `restriction`, traria também dezenas de regras de estilo
  genéricas do core não relacionadas a esta convenção.
- Array de dependências de hook incompleto → regra `react/exhaustive-deps` (equivalente ao
  `react-hooks/exhaustive-deps` do ecossistema ESLint clássico; nesta versão do oxlint o
  `react-hooks` não é um plugin separado, está embutido no plugin `react`). A regra de que hooks
  só podem ser chamados incondicionalmente (rules-of-hooks) também é verificada, pela regra
  `react/hooks`.
- Import de namespace em vez de nomeado → regra `import/no-namespace`, ligada individualmente
  como `error` pelo mesmo motivo do `no-explicit-any`: a categoria padrão dela, `style`, traria
  ruído não relacionado.
- Acessibilidade básica (`alt` em imagem, rótulo associado a campo de formulário, elemento
  clicável com suporte a teclado) → regras do plugin `jsx-a11y` (`jsx-a11y/alt-text`,
  `jsx-a11y/label-has-associated-control`, `jsx-a11y/click-events-have-key-events`, entre outras
  do conjunto padrão do plugin), ativas sempre que o plugin `jsx-a11y` está habilitado,
  independente da categoria de severidade configurada.
- Import interno usar o alias `@/` em vez de `../` → regra `import/no-relative-parent-imports`,
  ligada individualmente como `error` pelo mesmo motivo das demais regras pontuais desta lista.

Continua sendo revisão manual do `reviewer` (o oxlint não cobre):

- Separação de responsabilidades entre componente/hook/service ("Lógica fora do JSX") — convenção
  arquitetural, não regra de lint mecânica.
- Não guardar em `useState` um valor derivável do que já existe em render — idem, decisão de
  design, não mecânica.
- Ausência de comentários no código — não existe regra de lint que proíba comentários.
- Identificadores em inglês — não existe regra de lint que verifique o idioma de um identificador.
- Subpath import quando o pacote publica (`lodash/debounce` em vez de `lodash`) — não existe
  regra no oxlint para essa convenção.

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

## Padrão de branches, commits e PRs

Toda branch, commit e PR segue o padrão de `CONTRIBUTING.md`: branches como
`<tipo>/<número-da-issue>-<descrição-curta>` (ex.: `feat/21-agentes-e-skills`) e commits como
`<Tipo> <ícone> [#<número-da-issue>] <descrição>` (ex.: `Fix :bug: [#5] ...`), com o `<Tipo>`
vindo da tabela daquele arquivo (Fix, Feat, Hotfix, Refactor, Test, Perf, Style, Docs, Build,
Chore, Revert) — nunca uma label do GitHub (`enhancement`, etc.) no lugar do tipo. A descrição do
PR segue a estrutura de `.github/PULL_REQUEST_TEMPLATE.md`, não um corpo livre.

Quando `npm run build`, `npm run lint` e `npm test -- --run` já rodaram localmente (verificação
que o agente `executor` faz a cada tarefa, ver `.claude/agents/executor.md`) antes do `git push`,
o push é feito com `git push --no-verify` — a validação manual já cobre o que um hook rodaria de
novo, então repetir via hook no momento do push seria redundante.

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
