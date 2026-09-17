---
name: react-component-scaffold
description: Como criar um componente reutilizável neste template React, seguindo a convenção Componente + CSS Module + teste co-localizado. Use quando for adicionar, alterar, renomear ou remover um componente em src/components/.
---

# React Component Scaffold

**Tem rota própria → é página** (use a skill `react-page-scaffold`). **É reaproveitado dentro de outras telas e não tem rota → é componente**, e esta skill é a certa. Estrutura de página compartilhada (header/footer em volta de um `<Outlet />`) é `src/layouts/`, que não é assunto desta skill nem tem convenção fechada ainda (issue #24).

Um componente é composto por **duas peças que precisam existir juntas** — mais o teste, que é obrigatório e está na terceira linha da tabela. O estilo **não** é co-localizado; o teste **é**.

| Peça | Caminho | Se faltar |
| --- | --- | --- |
| Componente | `src/components/<Nome>.tsx` (PascalCase, **sem sufixo** de papel) | — |
| Estilo | `src/styles/components/<nome>.module.css` (camelCase) | `css.<classe>` vira `undefined`, o elemento renderiza sem `class` e sem erro nenhum |
| Teste | `src/components/<Nome>.test.tsx` | o `reviewer` bloqueia a revisão — a falta de teste co-localizado é reprovação incondicional |

`src/components/Button.tsx` + `src/styles/components/button.module.css` + `src/components/Button.test.tsx` são o trio de referência já no repositório, consumido em `src/pages/Home.page.tsx`. Como todo exemplo de template, existem para ensinar a convenção e devem ser substituídos ou removidos pelo projeto real que usar este repositório — não são peça permanente da aplicação.

## Passo a passo

### 1. Componente — `src/components/<Nome>.tsx`

Arquivo em PascalCase, **sem sufixo** de papel: `Button.tsx`, não `Button.component.tsx` (o sufixo existe para distinguir papéis dentro de uma pasta — `.page.tsx`, `.layout.tsx`, `.service.ts` —, e dentro de `components/` só há componentes). Componente `function <Nome>()` com `export default` no final do arquivo, não `export default function`.

```tsx
import css from "@/styles/components/button.module.css"

interface ButtonProps {
    label: string
    onClick?: () => void
}

function Button({ label, onClick }: ButtonProps) {
    return (
        <button type="button" className={css.button} onClick={onClick}>
            {label}
        </button>
    )
}

export default Button
```

Import interno sempre com o alias `@/`, nunca subindo de pasta com `../`.

### 2. Props — interface `<Nome>Props` no próprio arquivo

A interface de props fica **no arquivo do componente**, não em `src/types/`. `src/types/<nome>.types.ts` é para tipo compartilhado entre vários arquivos; props de um componente específico não são isso, e movê-las para lá só adiciona um import e um lugar a mais para desatualizar. A regra vem da #10 e está no `README.md`.

- Prop opcional com `?` (`onClick?: () => void`), e o valor padrão no destructuring quando fizer sentido.
- `strict` está ativo: nada de `any` explícito nem de cast para calar o compilador. Se o tipo for difícil, use `unknown` com checagem.
- **Nome de prop em inglês, texto visível em português.** `<Button label="Botão de exemplo" />` é o exemplo canônico, já em uso no `Home.page.tsx`: `Button` e `label` em inglês, o conteúdo que o usuário lê em português.

### 3. Composição em vez de mais uma prop booleana

Para um componente que embrulha conteúdo, receba `children`:

```tsx
import type { ReactNode } from "react"
import css from "@/styles/components/example.module.css"

interface ExampleProps {
    title: string
    children: ReactNode
}

function Example({ title, children }: ExampleProps) {
    return (
        <section className={css.example}>
            <h2>{title}</h2>
            {children}
        </section>
    )
}

export default Example
```

Quando a terceira prop booleana aparecer (`isCompact`, `hasBorder`, `withIcon`) e as combinações começarem a se excluir, o sinal é para expor um slot (`children`, ou uma prop de nó) em vez de somar mais um booleano.

Componente cuida de **renderização e interação**. Ele não busca dado nem guarda regra de negócio: acesso a dado externo vai para `src/services/` (`http.service.ts` é o exemplo) e lógica reutilizável vira hook em `src/hooks/` (`useToggle.ts` é o exemplo). Um componente que faz `fetch` direto não dá erro de compilação — dá trabalho de teste e de reuso.

### 4. Estilo — `src/styles/components/<nome>.module.css`

Nome do arquivo em camelCase, correspondendo ao componente (`Button.tsx` → `button.module.css`). O estilo **não** fica ao lado do componente: fica em `src/styles/components/`.

**Toda classe usada como `css.<algo>` no JSX precisa existir aqui.** `src/types/declarations.d.ts` tipa o módulo como `{ [key: string]: string }`, ou seja, qualquer chave compila — `css.naoExiste` não é erro de tipo, é `undefined` em runtime e o elemento sai sem `class`. É o bug aberto na issue #3 (`home.module.css` vazio com `css.main` em uso). Nem o `tsc` nem o teste pegam isso: confira o par JSX ↔ CSS a olho.

Use as custom properties de `src/styles/global.css` (`--g1-color` … `--g10-color`, `--sans-font`) em vez de valor hardcoded, como `button.module.css` faz:

```css
.button {
    font-family: var(--sans-font);
    border: 1px solid var(--g4-color);
    background-color: var(--g2-color);
    color: var(--g9-color);
}
```

Token novo de cor ou fonte entra em `global.css`; o que é específico do componente fica no CSS Module dele. Não introduza estilo inline nem CSS global de escopo local.

### 5. Acessibilidade mínima

É o que o `reviewer` audita, e o que faz `getByRole` funcionar no teste:

- **Elemento semântico certo.** `<button type="button">` para ação, nunca `<div onClick>` — a `div` não recebe foco, não responde a Enter/Espaço e não tem papel de botão. `type="button"` evita o submit implícito dentro de `<form>`.
- **Nome acessível.** O texto visível já serve (`{label}` dentro do `<button>`). Se o controle só tem ícone, ele precisa de `aria-label` em português.
- **`alt` em toda imagem** — descritivo, ou `alt=""` quando a imagem for puramente decorativa.
- Navegação interna com `<Link to="...">`/`useNavigate` do `react-router-dom`, nunca `<a href>` para rota interna: a âncora crua força reload completo e descarta o estado da aplicação (issue #5). Componente com `<Link>` dentro só renderiza sob um router — o teste dele precisa de `MemoryRouter` em volta.

### 6. Teste — `src/components/<Nome>.test.tsx`

Todo componente novo ou alterado precisa do teste co-localizado, no mesmo commit. Não é tarefa para depois: o `reviewer` trata a ausência como bloqueante incondicional.

**Como escrever e rodar o teste está na skill `vitest-specialist`** (`.claude/skills/vitest-specialist/SKILL.md`) — esta skill não repete a receita. `src/components/Button.test.tsx` é o exemplo de teste de componente com render e clique.

## Consumindo o componente

```tsx
import Button from "@/components/Button"

<Button label="Botão de exemplo" onClick={() => alert("Botão de exemplo clicado.")} />
```

## Checklist

- [ ] `src/components/<Nome>.tsx` criado, PascalCase e sem sufixo, com `export default` no final
- [ ] Interface `<Nome>Props` no próprio arquivo do componente, sem `any`
- [ ] Nome de prop em inglês; só o texto visível ao usuário em português
- [ ] `src/styles/components/<nome>.module.css` criado, e **toda** classe usada como `css.<algo>` existe nele
- [ ] Cores e fonte vindas das custom properties de `global.css`
- [ ] Elemento semântico correto, com nome acessível (e `alt` em imagem)
- [ ] `src/components/<Nome>.test.tsx` criado, cobrindo render e interação (ver `vitest-specialist`)
- [ ] Sem comentário no código, import interno com `@/` e nunca `../`
- [ ] `npx tsc --noEmit`, `npm test -- --run` e `npm run build` passando
- [ ] O componente foi visto renderizado (`npm run dev`) — o build passar não prova que o estilo foi aplicado

## Ao remover ou renomear um componente

Remova ou renomeie as três peças juntas — componente, CSS Module e teste — e só então procure quem importava:

```bash
grep -rn "components/<Nome>" src/
```

Um import órfão quebra o build e aparece logo. Um **CSS Module órfão não quebra nada** e fica esquecido no repositório; um **teste que ficou para trás** ou deixa de ser coletado (se o nome saiu da convenção) ou passa a testar um import morto e derruba o build. Ao renomear, o arquivo de estilo acompanha em camelCase (`Example.tsx` → `example.module.css`) e o teste em PascalCase (`Example.test.tsx`).
