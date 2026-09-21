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

## Comandos

```bash
npm run dev      # dev server do Vite (porta padrão 5173)
npm run build    # checagem de tipos (tsc --noEmit) + build de produção em dist/
npm run preview  # serve o conteúdo de dist/ — depende de um npm run build anterior
npm test         # Vitest em watch mode
npm test -- --run # execução one-shot (CI)
npx tsc --noEmit # checagem de tipos isolada
```

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
