# Novo projeto

Template base de frontend em React + TypeScript, ponto de partida para novos projetos.

Ele serve a quem quer começar um frontend já com toolchain, roteamento, testes, lint e convenções
de código definidos, sem decidir tudo do zero. Traz só a base mínima: uma `Home`, uma `NotFound`,
uma página de erro, um layout com header e footer e um serviço HTTP genérico. Não traz estado
global, autenticação nem componentes de UI prontos — o projeto que usa o template adiciona isso
quando precisar, seguindo as convenções abaixo.

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
5. Substitua o conteúdo da `Home` (`src/pages/Home.page.tsx`) e da `NotFound`
   (`src/pages/NotFound.page.tsx`) pelo do projeto real.

## Estrutura de `src/`

Cada pasta tem um papel definido, uma convenção de nome de arquivo e um tipo de export esperado.
Siga essa tabela ao adicionar código novo. As pastas que ainda não têm arquivo (`components/`,
`hooks/`, `utils/`, `pages/hooks/`) são criadas no primeiro uso.

| Pasta | Guarda | Nome do arquivo | Export |
| --- | --- | --- | --- |
| `components/` | Componentes de UI reutilizáveis, sem rota própria. | `<Nome>.tsx` (PascalCase, sem sufixo) | `export default` no final do arquivo |
| `layouts/` | Estruturas de página compartilhadas (header/footer ao redor de `<Outlet />`). | `<Nome>.layout.tsx` | `export default` no final do arquivo |
| `pages/` | Telas ligadas a uma rota. | `<Nome>.page.tsx` | `export default` no final do arquivo |
| `routers/` | Registro das rotas da aplicação e módulos auxiliares de roteamento. | `Router.tsx` (`export default`); `paths.ts` (export nomeado) | ver coluna anterior |
| `hooks/` | Hooks React reutilizáveis. | `use<Nome>.ts` | export **nomeado** |
| `services/` | Acesso a dado externo (HTTP e afins). | `<nome>.service.ts` | export **nomeado** |
| `types/` | Tipos compartilhados entre vários arquivos. | `<nome>.types.ts` / `<nome>.d.ts` | ver abaixo |
| `utils/` | Funções puras e auxiliares. | `<nome>.ts` (camelCase) | export **nomeado** |
| `styles/` | `global.css` (custom properties + reset) e CSS Modules por pasta. | `<nome>.module.css` (camelCase) | — |

### Imports internos

Use o alias `@/`, que resolve para `src/`:

```ts
import { ROUTES } from "@/routers/paths"
import css from "@/styles/pages/home.module.css"
```

Nunca suba de pasta com `../` — um import assim quebra ao mover o arquivo de lugar. O alias é
configurado em dois lugares que precisam concordar: `paths` no `tsconfig.app.json` e `resolve.alias`
no `vite.config.ts`. Import na mesma pasta ou descendo da própria localização (`./routers/Router`
em `src/App.tsx`) continua válido.

### CSS Modules

Os estilos não ficam co-localizados: o CSS Module de uma peça vive em
`src/styles/<pasta>/<nome>.module.css` (ex.: `src/pages/Home.page.tsx` →
`src/styles/pages/home.module.css`) e é importado como `import css from "..."`.

**Toda classe usada como `css.<algo>` no JSX precisa existir no `.module.css` importado.** A
tipagem em `src/types/declarations.d.ts` é `{ [key: string]: string }`, então uma classe
inexistente não gera erro de compilação — vira `undefined` e o elemento renderiza sem `class`.
Use as custom properties de `src/styles/global.css` (paleta, papéis semânticos, tipografia,
espaçamento, forma, movimento) em vez de valores hardcoded.

### Design tokens

> [!WARNING]
> A paleta (neutra, escura e de marca), a tipografia, o espaçamento, a forma e o movimento
> definidos em `src/styles/global.css` são escolha pessoal de
> [@felipe-sant](https://github.com/felipe-sant), baseada no design system do portfólio pessoal
> dele — não convenção da comunidade React/TypeScript. Troque esses valores livremente: nada no
> restante do template depende dos tokens específicos escolhidos aqui. A tipografia depende de um
> `@import` do Google Fonts (dependência de rede nova); para evitá-la, basta trocar
> `--font-heading`/`--font-body`/`--font-mono` por fontes locais ou de sistema e remover o
> `@import`.

### Exceção de sufixo: arquivos raiz/singulares

O sufixo de papel (`.page.tsx`, `.layout.tsx`, `.service.ts`, `.types.ts`) existe para distinguir
vários arquivos do mesmo tipo dentro de uma pasta. Arquivos que são **únicos no seu papel** e cujo
nome já é o próprio papel ficam isentos: `src/App.tsx`, `src/index.tsx` e `src/routers/Router.tsx`.

### `types/`: `*.types.ts` vs. `*.d.ts`

- `<nome>.types.ts` — tipos de domínio com **export nomeado**, importados explicitamente por
  outros arquivos (ex.: `product.types.ts`).
- `<nome>.d.ts` — declaração de ambiente/global, **nunca importada**: o TypeScript a carrega
  sozinho por estar dentro de `src/` (ex.: `declarations.d.ts`, que tipa `*.module.css`).

Props de um componente específico (ex.: `SaveButtonProps`) ficam no próprio arquivo do componente,
não em `types/`.

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
npm run build    # typecheck + build de produção em dist/
npm run preview  # serve o conteúdo de dist/ — depende de um npm run build anterior
npm test         # Vitest em watch mode
npm test -- --run # execução one-shot (CI)
npm run typecheck # checagem de tipos (tsc -b) de src/ e vite.config.ts
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

Cada formato tem seu jeito: página renderizada direto, árvore de rotas sob um router em memória,
componente com interação (`user-event`), hook com `renderHook`, função pura e módulo com `fetch`
stubado via `vi.stubGlobal` (como em `src/services/http.service.test.ts`). A skill
`vitest-specialist` em `.claude/skills/` traz um trecho de cada um.

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
