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

`Home.page.tsx` e `NotFound.page.tsx` são os exemplos de referência já no repositório. Como todo exemplo de template, existem para serem copiados e depois substituídos pelas páginas reais do projeto — não são peça permanente da aplicação.

## Passo a passo

### 1. Componente — `src/pages/<Nome>.page.tsx`

Nome do arquivo em PascalCase com sufixo `.page.tsx`. Componente `function <Nome>Page()`, com `export default` no final (não `export default function`, para seguir o padrão dos dois exemplos existentes).

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

### 2. Estilo — `src/styles/pages/<nome>.module.css`

Nome do arquivo em camelCase, correspondendo ao componente (`NotFound.page.tsx` → `notFound.module.css`).

**Toda classe usada como `css.<algo>` no JSX precisa existir aqui.** `src/types/declarations.d.ts` tipa o módulo como `{ [key: string]: string }`, ou seja, qualquer chave compila — `css.naoExiste` não é erro de tipo, é `undefined` em runtime e o elemento sai sem `class`. É exatamente o bug aberto na issue #3 (`home.module.css` vazio com `css.main` em uso). Confira o par JSX ↔ CSS a olho antes de dar a tarefa por concluída.

Use as custom properties de `src/styles/global.css` (`--g1-color` … `--g10-color`, `--sans-font`) em vez de repetir valor hardcoded.

### 3. Rota — `src/routers/Router.tsx`

Registre a página no `Router`. O `Routes` é importado com o alias `Switch`, e a rota `*` (NotFound) tem que continuar sendo a **última**:

```tsx
import Exemplo from "@/pages/Exemplo.page";

<Switch>
    <Route path="/" element={<Home />} />
    <Route path="/exemplo" element={<Exemplo />} />
    <Route path="*" element={<NotFound />} />
</Switch>
```

### 4. Metadados da página (quando necessário)

`App.tsx` define `<title>`/`<meta name="description">` padrão do site via `react-helmet`. Uma página só precisa declarar os seus se quiser sobrescrever — `NotFound.page.tsx` é o exemplo.

```tsx
import { Helmet } from "react-helmet"

<Helmet>
    <title>Título da página</title>
    <meta name="description" content="Descrição da página." />
</Helmet>
```

> A issue #15 prevê remover o `react-helmet` (sem manutenção, warnings em StrictMode no React 19) e usar `<title>`/`<meta>` nativos do React 19, que sobem sozinhos para o `<head>`. **Confira o que está valendo no código antes de copiar este trecho** — se `react-helmet` já tiver saído do `package.json`, escreva as tags direto no JSX, sem wrapper.

## Navegação entre páginas

Sempre `<Link to="/rota">` ou `useNavigate()` do `react-router-dom`. Nunca `<a href="/rota">` para rota interna: a âncora crua faz reload completo e descarta todo o estado da aplicação (issue #5). `<a href>` só para link externo.

## Checklist

- [ ] `src/pages/<Nome>.page.tsx` criado, com `export default`
- [ ] `src/styles/pages/<nome>.module.css` criado, e **toda** classe usada como `css.<algo>` existe nele
- [ ] Rota registrada em `src/routers/Router.tsx`, com `*` ainda por último
- [ ] Navegação interna usando `<Link>`, não `<a href>`
- [ ] Metadados declarados se a página precisar sobrescrever os do `App.tsx`
- [ ] Valores de cor/fonte vindos das custom properties de `global.css`
- [ ] `npx tsc --noEmit` e `npm run build` passando
- [ ] A rota foi aberta no navegador e renderiza a página certa (o build passar não prova isso)

## Ao remover ou renomear uma página

Remova as três peças juntas — componente, CSS Module e entrada no `Router.tsx`. Um import órfão no `Router.tsx` quebra o build; um CSS Module órfão não quebra nada e por isso fica esquecido no repositório.
