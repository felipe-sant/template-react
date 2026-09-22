# Novo projeto

Template base de frontend em React + TypeScript.

## Stack

- **React 19** — biblioteca de UI, com `StrictMode` habilitado em `src/index.tsx`.
- **TypeScript** — tipagem estática em modo `strict`, sem `any` explícito.
- **Vite** — dev server, build de produção e bundler (substitui o `react-scripts` do Create React App).
- **Vitest** (+ **Testing Library**) — execução de teste em ambiente `jsdom`, integrado ao mesmo `vite.config.ts`.
- **react-router-dom** — roteamento client-side, registrado em `src/routers/Router.tsx`.
- **CSS Modules** — estilo com escopo por arquivo, em `src/styles/`.

## Requisitos

- Node.js `>= 24.15.0` (major 24).
- O arquivo `.nvmrc` na raiz do repositório fixa a versão recomendada (`24.21.0`). Quem usa `nvm`
  pode rodar `nvm use` na raiz do repositório para obter automaticamente essa versão.
- Gerenciador de pacotes: `npm`. O repositório versiona `package-lock.json` — não use `yarn` nem
  `pnpm`, que gerariam um lockfile divergente.

## Começando

1. Use o botão "Use this template" no GitHub para criar um repositório novo a partir deste
   template (ou clone este repositório, se preferir).
2. Instale as dependências: `npm install`.
3. Renomeie o projeto: o campo `name` em `package.json`, o `<title>` e o `<meta
   name="description">` em `index.html`, e o heading `# Novo projeto` deste `README.md`.
4. Suba o dev server (`npm run dev`) e confirme em `http://localhost:5173`.
5. Remova ou substitua os arquivos de exemplo pelo código real do projeto — ver a seção
   "[Arquivos de exemplo (descartáveis)](#arquivos-de-exemplo-descartáveis)" abaixo.

## Estrutura de `src/`

Cada pasta tem um papel definido, uma convenção de nome de arquivo e um tipo de export esperado.
Siga essa tabela ao adicionar código novo.

| Pasta | Guarda | Nome do arquivo | Export |
| --- | --- | --- | --- |
| `components/` | Componentes de UI reutilizáveis, sem rota própria. | `<Nome>.tsx` (PascalCase, sem sufixo) | `export default` no final do arquivo |
| `layouts/` | Estruturas de página compartilhadas (header/footer ao redor de `<Outlet />`). | `<Nome>.layout.tsx` | `export default` no final do arquivo |
| `pages/` | Telas ligadas a uma rota. | `<Nome>.page.tsx` | `export default` no final do arquivo |
| `routers/` | Registro das rotas da aplicação. | `Router.tsx` (arquivo único) | `export default` no final do arquivo |
| `hooks/` | Hooks React reutilizáveis. | `use<Nome>.ts` | export **nomeado** |
| `services/` | Acesso a dado externo (HTTP e afins). | `<nome>.service.ts` | export **nomeado** |
| `types/` | Tipos compartilhados entre vários arquivos. | `<nome>.types.ts` / `<nome>.d.ts` | ver abaixo |
| `utils/` | Funções puras e auxiliares. | `<nome>.ts` (camelCase) | export **nomeado** |
| `styles/` | `global.css` (custom properties + reset) e CSS Modules por pasta. | `<nome>.module.css` (camelCase) | — |

### Imports internos

Use o alias `@/`, que resolve para `src/`:

```ts
import Button from "@/components/Button"
import css from "@/styles/pages/home.module.css"
```

Nunca suba de pasta com `../` — um import assim quebra ao mover o arquivo de lugar. O alias é
configurado em dois lugares que precisam concordar: `paths` no `tsconfig.json` e `resolve.alias`
no `vite.config.ts`. Import na mesma pasta ou descendo da própria localização (`./routers/Router`
em `src/App.tsx`) continua válido.

### CSS Modules

Os estilos não ficam co-localizados: o CSS Module de uma peça vive em
`src/styles/<pasta>/<nome>.module.css` (ex.: `src/components/Button.tsx` →
`src/styles/components/button.module.css`) e é importado como `import css from "..."`.

**Toda classe usada como `css.<algo>` no JSX precisa existir no `.module.css` importado.** A
tipagem em `src/types/declarations.d.ts` é `{ [key: string]: string }`, então uma classe
inexistente não gera erro de compilação — vira `undefined` e o elemento renderiza sem `class`.
Use as custom properties de `src/styles/global.css` (`--g1-color` … `--g10-color`,
`--sans-font`) em vez de valores hardcoded.

### Exceção de sufixo: arquivos raiz/singulares

O sufixo de papel (`.page.tsx`, `.layout.tsx`, `.service.ts`, `.types.ts`) existe para distinguir
vários arquivos do mesmo tipo dentro de uma pasta. Arquivos que são **únicos no seu papel** e cujo
nome já é o próprio papel ficam isentos: `src/App.tsx`, `src/index.tsx` e `src/routers/Router.tsx`.

### `types/`: `*.types.ts` vs. `*.d.ts`

- `<nome>.types.ts` — tipos de domínio com **export nomeado**, importados explicitamente por
  outros arquivos (ex.: `example.types.ts`).
- `<nome>.d.ts` — declaração de ambiente/global, **nunca importada**: o TypeScript a carrega
  sozinho por estar dentro de `src/` (ex.: `declarations.d.ts`, que tipa `*.module.css`).

Props de um componente específico (ex.: `ButtonProps`) ficam no próprio arquivo do componente,
não em `types/`.

### Arquivos de exemplo (descartáveis)

Os arquivos abaixo existem **apenas para ensinar a convenção** e devem ser substituídos ou
removidos pelo projeto real que usar este template:

- `src/components/Button.tsx` + `src/styles/components/button.module.css` +
  `src/components/Button.test.tsx` (consumido em `src/pages/Home.page.tsx`, também como exemplo).
- `src/layouts/Main.layout.tsx` + `src/styles/layouts/main.module.css` — ainda **não registrado em
  nenhuma rota**; a rota de layout com `<Outlet />` é escopo da issue #24.
- `src/hooks/useToggle.ts`
- `src/services/http.service.ts`
- `src/types/example.types.ts`
- `src/utils/formatDate.ts`
- `src/pages/Home.page.tsx` + `src/pages/Home.page.test.tsx`.
- `src/pages/NotFound.page.tsx` + `src/pages/NotFound.page.test.tsx`. `src/routers/Router.test.tsx`
  também depende do `NotFoundPage` de exemplo (cobre a rota-fallback renderizando-o) — ao
  substituir essa página, revise esse teste em vez de apagá-lo inteiro.

## Variáveis de ambiente

A convenção de variáveis de ambiente é a do Vite, não a do Create React App: só variável com
prefixo `VITE_` é exposta ao código do cliente, e a leitura em código é `import.meta.env.VITE_ALGO`
— não `process.env.REACT_APP_ALGO`, que era a convenção do `react-scripts` e não existe mais neste
template.

Para configurar o ambiente local, copie `.env.example` para `.env` e preencha o valor real de cada
variável:

```bash
cp .env.example .env
```

`.env` (e variações locais como `.env.local`) não são versionados — o `.gitignore` já cobre esses
arquivos, nenhuma configuração adicional é necessária.

Toda variável nova declarada em `.env.example` precisa de uma entrada correspondente em
`src/vite-env.d.ts`, na interface `ImportMetaEnv`, para que `import.meta.env` tenha
autocomplete e checagem de tipo.

## Comandos

```bash
npm run dev      # dev server do Vite (porta padrão 5173)
npm run build    # checagem de tipos (tsc --noEmit) + build de produção em dist/
npm run preview  # serve o conteúdo de dist/ — depende de um npm run build anterior
npm test         # Vitest em watch mode
npm test -- --run # execução one-shot (CI)
npx tsc --noEmit # checagem de tipos isolada
npm run lint      # roda o oxlint sobre o projeto, usando a configuração de .oxlintrc.json
npm run lint:fix  # mesma coisa que npm run lint, mas aplicando automaticamente as correções possíveis (oxlint --fix)
npm run format    # roda prettier --write em src/**/*.{ts,tsx} e vite.config.ts, conforme as regras de .prettierrc
npm run test:cov  # roda vitest run --coverage — suíte inteira + relatório de cobertura
```

> [!WARNING]
> As regras de formatação em `.prettierrc` (`tabWidth: 4`, `trailingComma: "none"`, sem ponto e
> vírgula, aspas duplas, etc.) e de lint em `.oxlintrc.json` são escolha pessoal de
> [@felipe-sant](https://github.com/felipe-sant), não convenção da comunidade React/TypeScript.
> Quem preferir 2 espaços de indentação, ponto e vírgula ou outra convenção pode simplesmente
> editar esses dois arquivos — nada no restante do template depende dos valores específicos
> escolhidos aqui.

### Git hooks

`npm install` configura automaticamente (via script `prepare`) um hook de `pre-commit` do
[Husky](https://typicode.github.io/husky/) que roda `lint-staged` em cada commit — nenhum passo
manual extra é necessário. `lint-staged` (configurado em `.lintstagedrc.json`) aplica `oxlint --fix`
e depois `prettier --write` só nos arquivos `.ts`/`.tsx` staged, corrigindo o que for automático ou
bloqueando o commit quando sobrar um erro de lint que o `oxlint` não sabe corrigir sozinho. O
`.editorconfig` na raiz complementa isso para editores compatíveis: padroniza charset, final de
linha, quebra de linha final, remoção de espaço em branco à direita e indentação (2 espaços por
padrão, 4 para `.ts`/`.tsx`/`.css`) antes mesmo de o Prettier rodar.

### Testes

O teste fica **co-localizado**: `<arquivo>.test.tsx` ao lado do arquivo testado
(`src/pages/Home.page.test.tsx`), nunca em `__tests__/` nem com sufixo `.spec.tsx`. O ambiente é
`jsdom` e o setup é `src/setupTests.ts`, registrado em `test.setupFiles` do `vite.config.ts` — é
ele que registra os matchers do `jest-dom` (`toBeInTheDocument()` e companhia).

Use `.test.ts` (sem `x`) para o que não renderiza JSX — hook, util, service.

Os testes que vêm no template servem de modelo, um por formato: `Home.page.test.tsx` renderiza a
página direto, `Router.test.tsx` renderiza a árvore de rotas (`AppRoutes`) sob `MemoryRouter` para
verificar que uma URL inexistente cai no `NotFound`, `Button.test.tsx` cobre um componente com
interação (clique disparando `onClick`), `useToggle.test.ts` usa `renderHook` para um hook,
`formatDate.test.ts` cobre uma função pura, `http.service.test.ts` stuba o `fetch` com
`vi.stubGlobal` e `Main.layout.test.tsx` preenche o `<Outlet />` com uma rota-filha.

`npm run test:cov` roda a suíte inteira com relatório de cobertura (`@vitest/coverage-v8`),
gerando os formatos `text`, `json`, `json-summary` e `html` em `coverage/` (fora do controle de
versão) e exigindo um mínimo de 80% em statements, branches, functions e lines (bloco
`test.coverage` em `vite.config.ts`) — abaixo disso o comando falha.

### CI

`.github/workflows/ci.yml` roda em todo push para `main` e em todo Pull Request, com três jobs:
`build` e `lint` sempre completos (`npm run build` e `npm run lint`); e `test`, cujo escopo
depende do contexto — suíte completa com `npm run test:cov` (respeitando o threshold de 80%
acima) quando o evento é push em `main`, quando o PR mira `main`, ou quando o diff altera um
arquivo "suite-wide" (`package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`,
`src/setupTests.ts`); nos demais Pull Requests, roda só `vitest --changed`, sem coverage, testando
apenas o que o diff afeta. Quando a suíte completa roda, `coverage/` é publicado como artifact do
workflow.
