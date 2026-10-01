---
name: react-page-scaffold
description: Como criar uma página nova neste template React, seguindo a convenção Page + CSS Module + namespace de tradução + registro de rota. Use quando for adicionar, renomear ou remover uma página em src/pages/.
---

# React Page Scaffold

Toda página deste template é composta por **quatro peças que precisam existir juntas**. Estilo e rota faltando produzem falha silenciosa, que o compilador não pega; o namespace é a única peça com rede de segurança, porque a tipagem do i18next transforma namespace ou chave inexistente em erro de `npm run typecheck`.

| Peça | Caminho | Se faltar |
| --- | --- | --- |
| Componente | `src/pages/<Nome>.page.tsx` | — |
| Estilo | `src/styles/pages/<nome>.module.css` | `css.<classe>` vira `undefined`, elemento renderiza sem estilo |
| Namespace de tradução | `src/locales/{pt-BR,en,es}/<nome>.json` + registro em `src/i18n/resources.ts` e `src/i18n/i18n.ts` | `t("<chave>")` não compila; chave ausente em `en`/`es` também quebra o `npm run typecheck` |
| Rota | entrada em `src/routers/Router.tsx` | a página existe mas é inalcançável; a URL cai no `NotFound` |

`Home.page.tsx` e `NotFound.page.tsx` são as páginas-base já no repositório e servem de modelo para as quatro peças. O projeto que usa o template substitui o conteúdo delas pelo seu.

Há uma quinta peça, mas **condicional**: se a página tiver lógica de estado/efeito (fetch, `useState`, `useEffect`), essa lógica vai para um hook dedicado em `src/pages/hooks/use<Nome>.ts` — ver passo 2. Página só apresentacional, como `Home.page.tsx` e `NotFound.page.tsx`, não tem essa peça.

Nenhum texto que o usuário lê fica literal no JSX: tudo vem de chave, via `t()` ou `<Trans>`, com o valor em `src/locales/`. `npm run lint` acusa texto literal como filho de elemento e em atributos como `title`, `alt`, `placeholder`, `aria-label` e `content` (regra `react/jsx-no-literals`, desligada só em `*.test.ts(x)`).

## Passo a passo

### 1. Componente — `src/pages/<Nome>.page.tsx`

Nome do arquivo em PascalCase com sufixo `.page.tsx`. Componente `function <Nome>Page()`, com `export default` no final (não `export default function`, para seguir o padrão das páginas-base `Home` e `NotFound`).

O texto vem do namespace da página (passo 4), com `useTranslation("<namespace>")`:

```tsx
import { useTranslation } from "react-i18next"
import css from "@/styles/pages/about.module.css"

function AboutPage() {
    const { t } = useTranslation("about")

    return (
        <main className={css.main}>
            <h1>{t("heading")}</h1>
        </main>
    )
}

export default AboutPage
```

A tag raiz é `<main>` — `src/styles/global.css` já aplica `min-height: 100dvh` nela.

Texto compartilhado entre telas (`backHome`, `loading`) fica no namespace `common`. Para usá-lo junto com o da página, passe os dois namespaces em array e prefixe a chave compartilhada com `common:` — sem o array, a chave `common:backHome` não compila. `NotFound.page.tsx` é o modelo:

```tsx
const { t } = useTranslation(["notFound", "common"])

<Link to={ROUTES.home}>{t("common:backHome")}</Link>
```

Texto com marcação no meio (negrito, link) usa `<Trans>` em vez de quebrar a frase em várias chaves. A tag fica no valor do JSON (`"... um trecho em <strong>destaque</strong>."`) e o componente correspondente vai em `components`, como em `Home.page.tsx`:

```tsx
<Trans t={t} i18nKey="showcase.description" components={{ strong: <strong /> }} />
```

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

type ItemsState =
    | { status: "loading" }
    | { status: "error" }
    | { status: "success"; items: string[] }

export function useItems(): ItemsState {
    const [state, setState] = useState<ItemsState>({ status: "loading" })

    useEffect(() => {
        get<string[]>(`${import.meta.env.VITE_API_URL}/items`)
            .then((items) => setState({ status: "success", items }))
            .catch(() => setState({ status: "error" }))
    }, [])

    return state
}
```

```tsx
import { useTranslation } from "react-i18next"
import { useItems } from "@/pages/hooks/useItems"

function AboutPage() {
    const { t } = useTranslation(["about", "common"])
    const state = useItems()

    return (
        <main>
            {state.status === "loading" && <p>{t("common:loading")}</p>}
            {state.status === "error" && <p role="alert">{t("loadError")}</p>}
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

export default AboutPage
```

O hook não devolve texto de UI: devolve estado, e o componente escolhe a chave a exibir.
Página só apresentacional, sem estado nem efeito (como `Home.page.tsx` e `NotFound.page.tsx`), não
tem hook — este passo não se aplica.

### 3. Estilo — `src/styles/pages/<nome>.module.css`

Nome do arquivo em camelCase, correspondendo ao componente (`NotFound.page.tsx` → `notFound.module.css`).

**Toda classe usada como `css.<algo>` no JSX precisa existir aqui.** `src/types/declarations.d.ts` tipa o módulo como `{ [key: string]: string }`, ou seja, qualquer chave compila — `css.missingClass` não é erro de tipo, é `undefined` em runtime e o elemento sai sem `class`. Foi exatamente o caso da issue #3 (`home.module.css` vazio com `css.main` em uso), já corrigida. Confira o par JSX ↔ CSS a olho antes de dar a tarefa por concluída.

Use as custom properties de `src/styles/global.css` (`--g1-color` … `--g10-color`, `--sans-font`) em vez de repetir valor hardcoded.

### 4. Namespace de tradução — `src/locales/{pt-BR,en,es}/<nome>.json`

O namespace tem o mesmo nome do CSS Module da página (`about.module.css` → `about`; `NotFound.page.tsx` → `notFound`). Chaves em inglês, lowerCamelCase e hierárquicas por papel: `meta.title`, `meta.description`, `heading`, `showcase.status.success`. JSON com 2 espaços de indentação.

1. Crie `src/locales/pt-BR/<nome>.json` primeiro. `pt-BR` é a língua de referência: o texto novo nasce em português e os JSON de `pt-BR` são a fonte do tipo das chaves.

   ```json
   {
     "meta": {
       "title": "Sobre",
       "description": "Quem somos e o que fazemos."
     },
     "heading": "Sobre",
     "loadError": "Não foi possível carregar os itens."
   }
   ```

2. Crie `src/locales/en/<nome>.json` e `src/locales/es/<nome>.json` com **as mesmas chaves**, valores traduzidos.
3. Em `src/i18n/resources.ts`, importe os três arquivos e acrescente o namespace aos objetos `ptBR`, `en` e `es`:

   ```ts
   import enAbout from "@/locales/en/about.json"
   import esAbout from "@/locales/es/about.json"
   import ptBRAbout from "@/locales/pt-BR/about.json"

   const ptBR = {
       common: ptBRCommon,
       about: ptBRAbout
   }

   const en: typeof ptBR = {
       common: enCommon,
       about: enAbout
   }

   const es: typeof ptBR = {
       common: esCommon,
       about: esAbout
   }
   ```

4. Acrescente o nome ao array `ns` do `init()` em `src/i18n/i18n.ts`.

`en` e `es` são tipados como `typeof ptBR`: namespace ou chave que existe em `pt-BR` e falta em `en`/`es` quebra o `npm run typecheck`. Chave sobrando em `en`/`es` não é pega pelo tipo, só por `src/i18n/test/resources.test.ts`.

### 5. Rota — `src/routers/paths.ts` e `src/routers/Router.tsx`

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

### 6. Metadados da página (quando necessário)

Cada página declara os próprios `<title>` e `<meta>` direto no JSX, com as tags nativas do React 19, que sobem sozinhas para o `<head>` — sem biblioteca nem wrapper. Eles substituem os placeholders estáticos do `index.html` (`<title>Template React</title>` e a `<meta name="description">`). O texto vem das chaves `meta.title` e `meta.description` do namespace da página; a troca de idioma re-renderiza a página e o React atualiza o `<head>`. `NotFound.page.tsx` e `Home.page.tsx` são os modelos:

```tsx
<>
    <title>{t("meta.title")}</title>
    <meta name="description" content={t("meta.description")} />
    <main className={css.main}>
        <h1>{t("heading")}</h1>
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
- [ ] Nenhum texto de UI literal no JSX: tudo vem de `t()`/`<Trans>` (`npm run lint` passando)
- [ ] Namespace `<nome>` criado em `src/locales/pt-BR/`, `src/locales/en/` e `src/locales/es/`, com as mesmas chaves nos três
- [ ] Namespace importado e registrado nos objetos `ptBR`, `en` e `es` de `src/i18n/resources.ts` e no array `ns` de `src/i18n/i18n.ts`
- [ ] Rota registrada em `src/routers/Router.tsx`, com `*` ainda por último
- [ ] Navegação interna usando `<Link>`, não `<a href>`
- [ ] Metadados declarados com `t("meta.title")`/`t("meta.description")` se a página precisar substituir os placeholders do `index.html`
- [ ] Valores de cor/fonte vindos das custom properties de `global.css`
- [ ] `npm run typecheck`, `npm run build` e `npm test -- --run src/i18n/test/resources.test.ts` passando
- [ ] A rota foi aberta no navegador e renderiza a página certa (o build passar não prova isso)

## Ao remover ou renomear uma página

Remova as quatro peças juntas — componente, CSS Module, namespace e entrada no `Router.tsx`. O namespace sai dos três idiomas (`src/locales/pt-BR/`, `src/locales/en/`, `src/locales/es/`), dos imports e dos objetos `ptBR`, `en` e `es` de `src/i18n/resources.ts` e do array `ns` de `src/i18n/i18n.ts`. Um import órfão no `Router.tsx` ou no `resources.ts` quebra o build; um CSS Module ou um JSON de tradução órfão não quebra nada e por isso fica esquecido no repositório.

Ao renomear, o namespace acompanha o novo nome do CSS Module: renomeie os três JSON e atualize `resources.ts`, `ns` e o `useTranslation` da página.
