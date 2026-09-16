---
name: vitest-specialist
description: Como escrever, rodar e depurar teste co-localizado neste template React com Vitest + Testing Library (jsdom). Use quando for criar, alterar, mover ou depurar qualquer arquivo *.test.tsx / *.test.ts em src/, ou mexer em src/setupTests.ts ou no bloco test do vite.config.ts.
---

# Vitest Specialist

Esta skill é dona do **arquivo de teste**. Como escrever a página ou o componente testado está nas skills `react-page-scaffold` e `react-component-scaffold`.

O stack é Vitest + `@testing-library/react` em ambiente `jsdom`, configurado no bloco `test` do `vite.config.ts` da raiz:

```ts
test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"]
}
```

Não há `globals: true` e não há `passWithNoTests` — as duas ausências têm consequência prática, abaixo.

## 1. Como rodar

| Comando | O que faz |
| --- | --- |
| `npm test` | **watch mode** (o script é `vitest`, sem `run`). Não termina. |
| `npm test -- --run` | execução one-shot. **É esta que você usa** num agente, em CI ou em terminal não-interativo. |
| `npm test -- --run src/pages/Home.page.test.tsx` | um arquivo só, one-shot. |
| `npx tsc --noEmit` | checagem de tipos isolada, inclusive dos arquivos de teste. |
| `npm run build` | `tsc --noEmit` + build de produção. Não roda teste. |

Rodar `npm test` puro dentro de um agente trava a sessão até o timeout: o processo fica esperando input que nunca vem. Sempre `-- --run`.

## 2. Suíte que não coleta nada falha

`passWithNoTests` foi removido da config de propósito: uma execução que não coleta **nenhum** teste sai com exit 1. O efeito colateral útil é que um arquivo de teste com nome fora da convenção não passa despercebido — mas o sintoma é enganoso. Você vê "No test files found" ou uma contagem menor do que esperava, **não** um erro apontando o arquivo errado. Se o teste que você acabou de escrever "não falhou nem passou", o problema é o nome ou o lugar do arquivo, não o conteúdo.

## 3. Nome e localização

`<arquivo>.test.tsx` **ao lado** do arquivo testado. Nunca uma pasta `__tests__/`, nunca o sufixo `.spec.tsx` — nenhum dos dois é coletado nem reconhecido como convenção aqui.

| Arquivo testado | Arquivo de teste |
| --- | --- |
| `src/pages/Home.page.tsx` | `src/pages/Home.page.test.tsx` |
| `src/components/Button.tsx` | `src/components/Button.test.tsx` |
| `src/routers/Router.tsx` | `src/routers/Router.test.tsx` |
| `src/hooks/useToggle.ts` | `src/hooks/useToggle.test.ts` |

As três primeiras linhas existem no repositório; a última é só a regra aplicada — `useToggle.ts` ainda não tem teste.

Use `.test.ts` (sem `x`) para o que não renderiza JSX — hook, util, service. `.test.tsx` só quando o arquivo tem JSX dentro.

## 4. `src/setupTests.ts` e o subpath — não "conserte" este import

O arquivo tem **uma linha só**, e ela é registrada em `test.setupFiles` do `vite.config.ts`:

```ts
import "@testing-library/jest-dom/vitest"
```

O subpath `/vitest` é obrigatório: ele registra os matchers no `expect` do **Vitest**. O entrypoint raiz (`@testing-library/jest-dom`) augmenta o namespace global `jest`, que o Vitest não usa. Trocar um pelo outro **compila normalmente** e quebra em runtime, com um erro que não menciona o import:

```
Invalid Chai property: toBeInTheDocument
```

Mesmo erro se o `setupFiles` sumir do `vite.config.ts`. Se você encontrar esse import e ele parecer "errado", ele não está: deixe como está.

## 5. Testar um componente ou página

`describe`, `it`, `expect` e `vi` vêm de um `import` explícito de `vitest` — **não** existe `globals: true` na config, então eles não estão no escopo global. Esquecer o import dá `describe is not defined`.

Render direto da página, como em `src/pages/Home.page.test.tsx`:

```tsx
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import HomePage from "@/pages/Home.page"

describe("HomePage", () => {
    it("renderiza o título principal", () => {
        render(<HomePage />)

        expect(screen.getByRole("heading", { name: "Hello World!" })).toBeInTheDocument()
    })
})
```

Import interno com `@/`, nunca `../`. O nome do `describe` é o identificador testado (inglês); a descrição do `it` é uma frase em português, como todo texto lido por gente.

### Mais de um `render` no mesmo arquivo: chame `cleanup`

A mesma ausência de `globals: true` desliga o **cleanup automático** do Testing Library: sem um `afterEach` global, ele não tem onde se registrar, e o DOM de um `it` continua montado no seguinte. O sintoma é `Found multiple elements with the role "button"` num teste que só renderizou uma vez. `src/components/Button.test.tsx` resolve na forma padrão:

```tsx
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Button from "@/components/Button"

afterEach(cleanup)

describe("Button", () => {
    it("dispara o onClick ao ser clicado", () => {
        const onClick = vi.fn()
        render(<Button label="Botão de exemplo" onClick={onClick} />)

        userEvent.click(screen.getByRole("button", { name: "Botão de exemplo" }))

        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
```

Arquivo com um `it` só não precisa — os dois testes que vieram da #19 não têm a linha.

## 6. Testar algo que depende de rota

`src/routers/Router.tsx` exporta duas coisas: `AppRoutes` (export **nomeado**, só as `<Route>`) e `Router` (export **default**, que envolve `AppRoutes` com `BrowserRouter`). No teste você renderiza **`AppRoutes` sob `MemoryRouter`**, como em `src/routers/Router.test.tsx`:

```tsx
import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import { AppRoutes } from "@/routers/Router"

describe("AppRoutes", () => {
    it("renderiza a página de NotFound em uma rota inexistente", () => {
        render(
            <MemoryRouter initialEntries={["/rota-que-nao-existe"]}>
                <AppRoutes />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "404 - Not Found" })).toBeInTheDocument()
    })
})
```

**Por que não renderizar o `Router` (export default):** ele já traz o `BrowserRouter` dentro, que lê a URL real do jsdom (`/`) e não aceita entrada inicial — não há como testar outra rota. E envolvê-lo em `MemoryRouter` aninha dois routers, o que quebra.

**Para testar o conteúdo de uma tela, importe a página direto** (como no item 5) em vez de atravessar a árvore de rotas. Assim o teste falha por um motivo só: se ele renderiza via rota, uma quebra no `Router.tsx` derruba junto o teste da página, e você perde tempo procurando no lugar errado. O teste de rota testa **roteamento** (qual URL cai em qual tela); o teste de página testa conteúdo.

Componente que usa `<Link>` ou `useNavigate` também precisa de um router em volta — sem ele o render estoura na hora.

## 7. Queries do Testing Library

Ordem de preferência: **`getByRole` com `name`** > `getByLabelText` / `getByText` > `getByTestId` (último recurso). `getByRole` consulta a árvore de acessibilidade — o que o usuário e o leitor de tela enxergam —, então além de encontrar o elemento ele pega regressão de acessibilidade: se o `<button>` virou `<div onClick>` ou a imagem perdeu o `alt`, a query falha. `getByTestId` passa mesmo com a marcação quebrada, por isso é o último recurso.

| Prefixo | Quando não acha | Use para |
| --- | --- | --- |
| `getBy*` | **estoura** | afirmar que o elemento está lá (o caso comum) |
| `queryBy*` | devolve `null` | afirmar **ausência**: `expect(screen.queryByRole("alert")).not.toBeInTheDocument()` |
| `findBy*` | estoura depois do timeout | o que aparece de forma **assíncrona** — sempre com `await` |

`getAllBy*`/`queryAllBy*`/`findAllBy*` para mais de um elemento. `findBy*` sem `await` devolve uma Promise que passa em qualquer `expect` de verdade/falsidade e nunca testa nada.

## 8. Interação

- **`fireEvent`** para disparar um evento cru: `fireEvent.click(element)`, `fireEvent.change(input, { target: { value: "texto" } })`.
- **`@testing-library/user-event`** quando a interação é uma sequência real de usuário (digitar caractere a caractere, `tab`, `hover`) — ele dispara a cadeia de eventos que o navegador dispararia, e por isso pega bug que o `fireEvent` não pega.

> **Versão instalada: `@testing-library/user-event@13.5.0`.** Nessa versão a API é **síncrona e sem instância**: `userEvent.click(element)`, `userEvent.type(input, "texto")`, direto no default import. **`userEvent.setup()` não existe aqui** — a forma `const user = userEvent.setup(); await user.click(...)`, que aparece em praticamente todo exemplo encontrado na internet, é da v14 e quebra neste repositório (`userEvent.setup is not a function`). Não copie exemplo de v14. Subir para a v14 é pendência de `package.json`, não de documentação.

## 9. Erros comuns

| Sintoma | Causa |
| --- | --- |
| `Invalid Chai property: toBeInTheDocument` | o setup não carregou: `setupFiles` fora do `vite.config.ts`, ou o import do `setupTests.ts` trocado pelo entrypoint raiz em vez do subpath `/vitest` (item 4) |
| "No test files found", ou exit 1 sem nenhuma falha visível | nome ou lugar do arquivo fora da convenção — não é coletado, e sem `passWithNoTests` a suíte vazia falha (itens 2 e 3) |
| `useNavigate() may be used only in the context of a <Router>` | faltou `MemoryRouter` em volta do que usa `<Link>`/`useNavigate` (item 6) |
| `document is not defined` | `environment: "jsdom"` fora do bloco `test` do `vite.config.ts` |
| `Found multiple elements with the role ...` | render anterior não foi desmontado: falta `afterEach(cleanup)` no arquivo com mais de um `render` (item 5) |
| `describe is not defined` / `vi is not defined` | falta o `import` de `vitest` — não há `globals: true` |
| `userEvent.setup is not a function` | exemplo de v14 num repositório com a v13 (item 8) |

**Teste que passaria com o setup desligado não prova nada.** `expect(element).toBeTruthy()` é verdadeiro para qualquer objeto, inclusive um nó fora do documento; prefira um matcher do `jest-dom` (`toBeInTheDocument`, `toHaveTextContent`, `toBeDisabled`) que afirma algo sobre o DOM. Vale o mesmo teste de sanidade de sempre: quebre a asserção de propósito uma vez e confirme que ela fica vermelha.

## Checklist

- [ ] Arquivo em `<caminho-do-arquivo-testado>.test.tsx`, ao lado do arquivo testado
- [ ] `describe`/`it`/`expect`/`vi` importados de `vitest`
- [ ] Import do arquivo testado com `@/`, nunca `../`
- [ ] Query por `getByRole` com `name` sempre que possível; `getByTestId` só como último recurso
- [ ] `MemoryRouter` em volta do que depende de rota; `AppRoutes`, não o `Router` default
- [ ] `afterEach(cleanup)` se o arquivo renderiza mais de uma vez
- [ ] `user-event` na API v13, sem `setup()`
- [ ] Sem comentário no código; nome de identificador em inglês, descrição do `it` em português
- [ ] `npm test -- --run` passa, e a contagem de arquivos cresceu com o arquivo novo
- [ ] `npx tsc --noEmit` passa

## Ao remover ou renomear o arquivo testado

Mova ou renomeie o `.test.tsx` **junto**, na mesma mudança. Se o arquivo testado sumiu e o teste ficou, ele quebra no import — visível e fácil. O caso silencioso é o contrário: um teste renomeado para fora da convenção simplesmente deixa de ser coletado, a suíte continua verde e a cobertura sumiu sem aviso. Depois de mover, rode `npm test -- --run` e **confira a contagem de arquivos**, não só o verde.
