---
name: react-page-scaffold
description: Como criar uma página nova neste template React, seguindo a convenção Page + CSS Module + registro de rota. Use quando for adicionar, renomear ou remover uma página em src/pages/.
---

# React Page Scaffold

Toda página deste template é composta por **três peças que precisam existir juntas**. Esquecer qualquer uma delas produz uma falha silenciosa — nenhuma das três é verificada pelo compilador.

| Peça | Caminho | Se faltar |
| --- | --- | --- |
| Componente | `src/pages/<Nome>.page.tsx` | — |
| Estilo | `src/styles/pages/<nome>.module.css` | `css.<classe>` vira `undefined`, elemento renderiza sem estilo |
| Rota | entrada em `src/routers/Router.tsx` | a página existe mas é inalcançável; a URL cai no `NotFound` |

`Home.page.tsx` e `NotFound.page.tsx` são as páginas-base já no repositório e servem de modelo para as três peças. O projeto que usa o template substitui o conteúdo delas pelo seu.

Há uma quarta peça, mas **condicional**: se a página tiver lógica de estado/efeito (fetch, `useState`, `useEffect`), essa lógica vai para um hook dedicado em `src/pages/hooks/use<Nome>.ts` — ver passo 2. Página só apresentacional, como `Home.page.tsx` e `NotFound.page.tsx`, não tem essa peça.

## Passo a passo

### 1. Componente — `src/pages/<Nome>.page.tsx`

Nome do arquivo em PascalCase com sufixo `.page.tsx`. Componente `function <Nome>Page()`, com `export default` no final (não `export default function`, para seguir o padrão das páginas-base `Home` e `NotFound`).

```tsx
import css from "@/styles/pages/exemplo.module.css"

function ExemploPage() {
    return (
        <main className={css.main}>
            <h1>Exemplo</h1>
        </main>
    )
}

export default ExemploPage
```

A tag raiz é `<main>` — `src/styles/global.css` já aplica `min-height: 100dvh` nela.

### 2. Hook de página (quando houver lógica de estado/efeito) — `src/pages/hooks/use<Nome>.ts`

Se a página busca dado (fetch), guarda estado (`useState`) ou roda efeito (`useEffect`), essa
lógica não fica no componente: vive num hook dedicado em `src/pages/hooks/use<Nome>.ts`,
exportando `use<Nome>()`. O `.page.tsx` só chama o hook e renderiza o retorno — sem
`useState`/`useEffect` nem chamada a service dentro do componente.

Isso é diferente de `src/hooks/`, reservado a hooks reutilizáveis entre páginas e componentes
(um `useDebounce` ou um `useMediaQuery`, por exemplo; a pasta é criada no primeiro uso).
`src/pages/hooks/` é para lógica específica de uma única página, que não faz sentido reaproveitar
em outro lugar.

Exemplo com carregamento, erro e sucesso (a pasta `src/pages/hooks/` também é criada no primeiro uso):

```ts
import { useEffect, useState } from "react"
import { get } from "@/services/http.service"

type ExampleState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "success"; items: string[] }

export function useExample(): ExampleState {
    const [state, setState] = useState<ExampleState>({ status: "loading" })

    useEffect(() => {
        get<string[]>(`${import.meta.env.VITE_API_URL}/items`)
            .then((items) => setState({ status: "success", items }))
            .catch((error: unknown) => {
                const message = error instanceof Error ? error.message : "Erro ao carregar."
                setState({ status: "error", message })
            })
    }, [])

    return state
}
```

```tsx
import { useExample } from "@/pages/hooks/useExample"

function ExemploPage() {
    const state = useExample()

    return (
        <main>
            {state.status === "loading" && <p>Carregando...</p>}
            {state.status === "error" && <p role="alert">{state.message}</p>}
            {state.status === "success" && (
                <ul>
                    {state.items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            )}
        </main>
    )
}

export default ExemploPage
```

Página só apresentacional, sem estado nem efeito (como `Home.page.tsx` e `NotFound.page.tsx`), não
tem hook — este passo não se aplica.

### 3. Estilo — `src/styles/pages/<nome>.module.css`

Nome do arquivo em camelCase, correspondendo ao componente (`NotFound.page.tsx` → `notFound.module.css`).

**Toda classe usada como `css.<algo>` no JSX precisa existir aqui.** `src/types/declarations.d.ts` tipa o módulo como `{ [key: string]: string }`, ou seja, qualquer chave compila — `css.naoExiste` não é erro de tipo, é `undefined` em runtime e o elemento sai sem `class`. Foi exatamente o caso da issue #3 (`home.module.css` vazio com `css.main` em uso), já corrigida. Confira o par JSX ↔ CSS a olho antes de dar a tarefa por concluída.

Use as custom properties de `src/styles/global.css` (`--g1-color` … `--g10-color`, `--sans-font`) em vez de repetir valor hardcoded.

### 4. Rota — `src/routers/paths.ts` e `src/routers/Router.tsx`

Adicione o path em `ROUTES` (`src/routers/paths.ts`) e registre a página como filha do `MainLayout` em `routes` (`RouteObject[]`, em `src/routers/Router.tsx`). A página é importada com `lazy` — o único `<Suspense>` já fica no `MainLayout`, em volta do `<Outlet />` — e a rota `*` (NotFound) tem que continuar sendo a **última**:

```tsx
export const ROUTES = {
    home: "/",
    about: "/about",
    notFound: "*"
} as const

const About = lazy(() => import("@/pages/About.page"))

export const routes: RouteObject[] = [
    {
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
            { path: ROUTES.home, element: <Home /> },
            { path: ROUTES.about, element: <About /> },
            { path: ROUTES.notFound, element: <NotFound /> }
        ]
    }
]
```

### 5. Metadados da página (quando necessário)

Cada página declara os próprios `<title>` e `<meta>` direto no JSX, com as tags nativas do React 19, que sobem sozinhas para o `<head>` — sem biblioteca nem wrapper. `NotFound.page.tsx` e `Home.page.tsx` são os modelos:

```tsx
<>
    <title>Título da página</title>
    <meta name="description" content="Descrição da página." />
    <main className={css.main}>
        <h1>Título</h1>
    </main>
</>
```

## Navegação entre páginas

Sempre `<Link to="/rota">` ou `useNavigate()` do `react-router-dom`. Nunca `<a href="/rota">` para rota interna: a âncora crua faz reload completo e descarta todo o estado da aplicação (issue #5). `<a href>` só para link externo.

## Checklist

- [ ] `src/pages/<Nome>.page.tsx` criado, com `export default`
- [ ] Se a página tiver lógica de estado/efeito, ela está em `src/pages/hooks/use<Nome>.ts`
      (exportando `use<Nome>()`) — o `.page.tsx` só chama o hook e renderiza o retorno
- [ ] `src/styles/pages/<nome>.module.css` criado, e **toda** classe usada como `css.<algo>` existe nele
- [ ] Rota registrada em `src/routers/Router.tsx`, com `*` ainda por último
- [ ] Navegação interna usando `<Link>`, não `<a href>`
- [ ] Metadados declarados se a página precisar sobrescrever os do `App.tsx`
- [ ] Valores de cor/fonte vindos das custom properties de `global.css`
- [ ] `npm run typecheck` e `npm run build` passando
- [ ] A rota foi aberta no navegador e renderiza a página certa (o build passar não prova isso)

## Ao remover ou renomear uma página

Remova as três peças juntas — componente, CSS Module e entrada no `Router.tsx`. Um import órfão no `Router.tsx` quebra o build; um CSS Module órfão não quebra nada e por isso fica esquecido no repositório.
