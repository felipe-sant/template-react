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
- **i18next** (+ **react-i18next** e **i18next-browser-languagedetector**) — internacionalização,
  com traduções em `src/locales/` e configuração em `src/i18n/` (ver
  [Internacionalização](#internacionalização)).

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
   name="description">` em `index.html`, o heading `# Novo projeto` deste `README.md` e, junto
   com o `name` do `package.json`, o valor de `LANGUAGE_STORAGE_KEY` em
   `src/i18n/languageStorageKey.ts` (`"template-react:language"` → `"<nome-do-projeto>:language"`).
4. Suba o dev server (`npm run dev`) e confirme em `http://localhost:5173`.
5. Substitua o conteúdo da `Home` (`src/pages/Home.page.tsx`) e da `NotFound`
   (`src/pages/NotFound.page.tsx`) pelo do projeto real. O texto dessas telas não fica no
   `.page.tsx`: fica em `src/locales/<idioma>/<namespace>.json` (`home.json`, `notFound.json`),
   um arquivo por idioma.

## Estrutura de `src/`

Cada pasta tem um papel definido, uma convenção de nome de arquivo e um tipo de export esperado.
Siga essa tabela ao adicionar código novo. As pastas que ainda não têm arquivo (`components/`,
`hooks/`, `utils/`, `pages/hooks/`) são criadas no primeiro uso.

| Pasta | Guarda | Nome do arquivo | Export |
| --- | --- | --- | --- |
| `components/` | Componentes de UI reutilizáveis, sem rota própria. | `<Nome>.tsx` (PascalCase, sem sufixo) | `export default` no final do arquivo |
| `layouts/` | Estruturas de página compartilhadas (header/footer ao redor de `<Outlet />`). | `<Nome>.layout.tsx` | `export default` no final do arquivo |
| `pages/` | Telas ligadas a uma rota. | `<Nome>.page.tsx` | `export default` no final do arquivo |
| `routers/` | Registro das rotas da aplicação e módulos auxiliares de roteamento. | `Router.tsx`, `routes.tsx`, `paths.ts` | `export default` no final do arquivo |
| `hooks/` | Hooks React reutilizáveis. | `use<Nome>.ts` | `export default` no final do arquivo |
| `services/` | Acesso a dado externo (HTTP e afins). | `<nome>/<verbo>.ts` (camelCase) | `export default` no final do arquivo |
| `types/` | Tipos compartilhados entre vários arquivos. | `<dominio>/<NomeDoTipo>.types.ts` / `<nome>.d.ts` | `export default` no final do arquivo (`.d.ts`: ver abaixo) |
| `utils/` | Funções puras e auxiliares. | `<nome>.ts` (camelCase) | `export default` no final do arquivo |
| `styles/` | `global.css` (custom properties + reset) e CSS Modules por pasta. | `<nome>.module.css` (camelCase) | — |
| `i18n/` | Configuração da internacionalização: instância do i18next, constantes de idioma e a API `getLanguage`/`setLanguage`. | `<nome>.ts` (camelCase), `i18n.ts` para a instância | `export default` no final do arquivo |
| `locales/` | Traduções: uma pasta por idioma, um JSON por namespace. | `<idioma>/<namespace>.json` (ex.: `pt-BR/home.json`) | — |

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

- `<dominio>/<NomeDoTipo>.types.ts` — um tipo exportado por arquivo, nomeado pelo tipo, com
  `export default` no final e importado com `import type` (ex.:
  `import type SupportedLanguage from "@/types/language/SupportedLanguage.types"`). O domínio é
  a área do código dona do tipo, em lowerCamelCase (`language`, `store`).
- `<nome>.d.ts` — declaração de ambiente/global, **nunca importada**: o TypeScript a carrega
  sozinho por estar dentro de `src/` (ex.: `declarations.d.ts`, que tipa `*.module.css`).

Tipo não exportado fica local ao arquivo que o usa, sem `export`: `<Nome>Props` de um componente
(ex.: `SaveButtonProps`), `<Nome>State`, retorno de hook de página e tipos de request/response de
um endpoint. Se outro arquivo precisar do tipo, ele sobe para `src/types/` em arquivo próprio.

A regra geral vale para todo o `src/`: export sempre no final do arquivo, nunca inline, e um
símbolo exportado por arquivo (valor ou tipo), sempre com `export default`. Só `*.d.ts` fica fora.

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

### `VITE_API_URL`

`.env.example` é o modelo: nele `VITE_API_URL` aponta para `https://api.example.com`. Para usar a
API real, troque o valor no seu `.env` pela URL base dela, sem barra no final. Só variável com
prefixo `VITE_` chega ao código do cliente.

`src/services/http/apiUrl.ts` é o único arquivo que lê `import.meta.env.VITE_API_URL`. `get` e
`post` (em `src/services/http/`) recebem **só o caminho relativo** e montam a URL final com
`apiUrl + path`:

```ts
import get from "@/services/http/get"

const controller = new AbortController()
const items = await get<string[]>("/items", { signal: controller.signal })
```

- `signal` é opcional e cancela a requisição, que rejeita com `AbortError`. Para timeout, use
  `AbortSignal.timeout(ms)` como `signal`.
- Com a variável vazia ou ausente, o caminho segue relativo (`/items`), útil com proxy do Vite.
- Resposta não-ok vira `Error` com o status e o corpo, quando houver.
- `get` e `post` enviam `Accept-Language` com o idioma ativo (`getLanguage()`).

## Internacionalização

Texto que o usuário lê não é escrito no código: o componente referencia uma **chave de tradução**
e o valor de cada idioma fica num JSON. A biblioteca é o
[i18next](https://www.i18next.com/), com `react-i18next` e `i18next-browser-languagedetector`; os
recursos vão embutidos no bundle e as chaves são tipadas, então `t("chave.inexistente")` falha no
`npm run typecheck`.

### Onde ficam as traduções

```
src/
├── i18n/       configuração (código)
└── locales/
    ├── pt-BR/{common,home,notFound,error,mainLayout}.json
    ├── en/(mesmos cinco)
    └── es/(mesmos cinco)
```

- `src/locales/` guarda os valores, editados por quem traduz; `src/i18n/` guarda a configuração. É
  a mesma separação que `src/styles/` faz com o CSS.
- **Um namespace por dono do texto**, com o nome do CSS Module correspondente (`home`, `notFound`,
  `error`, `mainLayout`). O namespace `common` é o padrão (`defaultNS`) e guarda texto
  compartilhado (`backHome`, `loading`) e texto fixo de componentes de `src/components/`
  (`common:saveButton.label`).
- **A chave é identificador**: em inglês, lowerCamelCase e hierárquica por papel (`meta.title`,
  `meta.description`, `heading`, `showcase.status.success`). Os JSON usam 2 espaços de indentação.
- `src/i18n/resources.ts` monta `{ "pt-BR": ..., en: ..., es: ... }` a partir dos JSON e tipa `en`
  e `es` como `typeof` dos recursos de `pt-BR`: namespace ou chave faltando em `en`/`es` vira erro de
  compilação. Chave sobrando não é pega pelo tipo, só por `src/i18n/test/resources.test.ts`, que também
  barra valor vazio.
- A tipagem das chaves vem de `src/types/i18next.d.ts` (augmentação de `CustomTypeOptions`) e o
  tipo `SupportedLanguage` de `src/types/language/SupportedLanguage.types.ts`.

Na página, o namespace entra no `useTranslation`; quando ela também usa texto de `common`, os dois
são declarados e a chave de `common` leva o prefixo:

```tsx
const { t } = useTranslation("home")
```

```tsx
const { t } = useTranslation(["notFound", "common"])

return <Link to={ROUTES.home}>{t("common:backHome")}</Link>
```

Metadados seguem o mesmo caminho (`<title>{t("meta.title")}</title>`, `<meta name="description"
content={t("meta.description")} />`), e texto com marcação no meio usa `<Trans>` com
`components={{ strong: <strong /> }}`, como em `src/pages/Home.page.tsx`.

### Idiomas

Os idiomas suportados são `pt-BR`, `en` e `es` (`SUPPORTED_LANGUAGES`, em
`src/i18n/supportedLanguages.ts`). Dois papéis diferentes, que não devem ser confundidos:

- **`pt-BR` é a língua de referência.** Texto novo nasce primeiro em `src/locales/pt-BR/`, os JSON de
  `pt-BR` são a fonte do tipo das chaves e os testes de tela afirmam o texto em português.
- **`en` é o fallback** (`FALLBACK_LANGUAGE`, em `src/i18n/fallbackLanguage.ts`): é o que o usuário
  vê quando nenhuma fonte de detecção dá um idioma suportado. Também vale por chave: uma chave
  ausente em `es` ou `pt-BR` mostra o valor de `en` só daquela chave.

### Como o idioma é escolhido

A ordem efetiva é:

1. a **escolha salva**, feita por `setLanguage` ou por um `?lng=` válido na URL;
2. o **idioma do navegador**, mapeado por `resolveSupportedLanguage` (`es-MX` → `es`, `en-GB` →
   `en`, `pt` e `pt-PT` → `pt-BR`);
3. **`en`**.

Um navegador em `fr` (ou `de`), sem escolha salva nem `?lng=`, abre em `en`. Valor inválido em
qualquer fonte (`?lng=xx`, um `"xx"` no `localStorage`) é ignorado e a detecção segue para a próxima.

**O idioma do navegador nunca é gravado.** O detector roda com `caches: []`: sem escolha salva, o
app lê o navegador de novo a cada carga, então quem troca o idioma do navegador vê o app
acompanhar. Só existe escolha salva depois que a pessoa escolhe um idioma, e o único código que
grava é `src/i18n/saveLanguage.ts`, chamado por `setLanguage` e pela persistência do `?lng=`.

**`?lng=` serve para linkar projetos mantendo o idioma.** O `localStorage` é isolado por origem,
então um portfólio que linka um projeto em outro domínio passa o idioma pela URL
(`https://usuario.github.io/projeto-x/?lng=es`). O `?lng=` vem antes da escolha salva, vence e
**substitui** uma escolha anterior: um `?lng=` válido é gravado e continua valendo nas visitas
seguintes, mesmo sem o parâmetro. Ele não é removido da URL.

A escolha fica no `localStorage` sob `LANGUAGE_STORAGE_KEY = "template-react:language"`
(`src/i18n/languageStorageKey.ts`), único lugar onde essa string aparece. Projetos derivados
publicados na mesma origem (`usuario.github.io/portfolio` e `usuario.github.io/projeto-x`)
compartilham o mesmo `localStorage`; com uma chave por projeto, cada um guarda a própria escolha e
a continuidade entre eles vem do `?lng=`. Por isso a chave é renomeada junto com o `name` do
`package.json` (passo 3 de [Começando](#começando)). Quem quiser que os projetos compartilhem a
escolha usa o mesmo valor nos dois.

O `<html lang>` acompanha o idioma ativo: `src/i18n/i18n.ts` atualiza `document.documentElement.lang`
a cada troca. O `index.html` continua com `lang="pt-BR"` porque descreve o conteúdo estático do
arquivo (`<title>`, `<meta name="description">`, `<noscript>`), que está em português; assim que o
JavaScript roda, o `lang` é corrigido.

### API de idioma

- `getLanguage()` (`@/i18n/getLanguage`) devolve o idioma ativo como `SupportedLanguage` — o
  salvo, o do navegador ou o fallback. É função comum, não hook, e serve também fora de React.
- `setLanguage(language)` (`@/i18n/setLanguage`) troca o idioma e grava a escolha. É assíncrona e
  só aceita `SupportedLanguage`, então passar um idioma não suportado é erro de tipo. Texto,
  `<title>`, `<meta name="description">` e `<html lang>` atualizam sem recarregar.

O template não traz seletor de idioma, só a API que ele usaria. O seletor chama `useTranslation()`
(para re-renderizar na troca), lê `getLanguage()` e lista `SUPPORTED_LANGUAGES`; cada opção recebe
`isActive` por prop e chama `setLanguage()`. A opção não lê `getLanguage()` sozinha porque não
assina a troca de idioma: envolvida em `memo`, ficaria com o estado antigo.

```tsx
import setLanguage from "@/i18n/setLanguage"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

interface LanguageOptionProps {
    language: SupportedLanguage
    isActive: boolean
}

function LanguageOption({ language, isActive }: LanguageOptionProps) {
    return (
        <button
            type="button"
            aria-pressed={isActive}
            onClick={() => void setLanguage(language)}
        >
            {language}
        </button>
    )
}

export default LanguageOption
```

```tsx
import { useTranslation } from "react-i18next"
import LanguageOption from "@/components/LanguageOption"
import getLanguage from "@/i18n/getLanguage"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"

function LanguageSelector() {
    const { t } = useTranslation()
    const activeLanguage = getLanguage()

    return (
        <nav aria-label={t("languageSelector.label")}>
            {SUPPORTED_LANGUAGES.map((language) => (
                <LanguageOption
                    key={language}
                    language={language}
                    isActive={language === activeLanguage}
                />
            ))}
        </nav>
    )
}

export default LanguageSelector
```

O rótulo do `<nav>` é texto fixo de componente, então vem de `common` — a chave
`languageSelector.label` precisa ser criada em `src/locales/{pt-BR,en,es}/common.json` antes de o
trecho compilar. O botão mostra o código do idioma (`pt-BR`, `en`, `es`); para mostrar o nome,
use uma chave por idioma.

### Adicionar uma chave

1. Escreva a chave e o valor em `src/locales/pt-BR/<namespace>.json`, a língua de referência.
2. Adicione a mesma chave em `src/locales/en/<namespace>.json` e `src/locales/es/<namespace>.json`.
   Se faltar em um deles, o `npm run typecheck` falha.
3. Use com `t("<chave>")` (ou `<Trans>`, se houver marcação no meio) no componente.

### Adicionar um namespace

1. Crie `src/locales/{pt-BR,en,es}/<namespace>.json`, com as mesmas chaves nos três.
2. Registre o JSON em `src/i18n/resources.ts`, nos objetos `ptBR`, `en` e `es`.
3. Inclua o nome na lista `ns` de `src/i18n/i18n.ts`.
4. Use com `useTranslation("<namespace>")`.

### Adicionar um idioma

1. Inclua o código em `SUPPORTED_LANGUAGES` (`src/i18n/supportedLanguages.ts`).
2. Crie `src/locales/<idioma>/` com todos os namespaces de `pt-BR`.
3. Registre os JSON em `src/i18n/resources.ts`: um objeto novo tipado como `typeof ptBR`, incluído
   em `resources`.
4. Para que variantes regionais caiam no idioma novo (`fr-CA` → `fr`), adicione o mapeamento em
   `LANGUAGE_BY_PRIMARY_SUBTAG` (`src/i18n/resolveSupportedLanguage.ts`).
5. Atualize os testes que listam os idiomas (`src/i18n/test/resources.test.ts`,
   `src/i18n/test/resolveSupportedLanguage.test.ts`, `src/i18n/test/getLanguage.test.ts`).

### Mensagens de `Error`

Mensagem de `Error` lançada no código do cliente (`src/services/http/parseResponse.ts`, `src/index.tsx`)
**não é traduzida**: continua literal, em português, como diagnóstico. O erro que chega ao usuário
vindo de uma API deve vir traduzido pelo backend — para isso, a
[#63](https://github.com/felipe-sant/template-react/issues/63) passa a enviar o header
`Accept-Language` com `getLanguage()` em toda requisição de `get`/`post` em `src/services/http/`. A convenção fica:
texto que a UI mostra vem de chave; mensagem de `Error` lançada no cliente é literal em português;
mensagem de erro de API vem traduzida pelo backend.

### Lint

`npm run lint` barra texto literal em JSX com a regra `react/jsx-no-literals` (`.oxlintrc.json`):

- texto solto como filho (`<p>Olá</p>`) e string em expressão como filho (`<p>{"Olá"}</p>`,
  ``<p>{`Olá`}</p>``);
- string nos atributos listados em `restrictedAttributes`: `title`, `alt`, `placeholder`,
  `aria-label`, `aria-description`, `label` e `content` (`<img alt="Foto" />`,
  `<meta name="description" content="Texto" />`).

As demais props não são verificadas (`ignoreProps: true`), então `type="button"`,
`name="description"`, `i18nKey="..."` e template literal em `className` passam. Os arquivos
`*.test.ts`/`*.test.tsx` ficam fora da regra. Um caso não é pego e fica para a revisão: texto
entre chaves num atributo restrito (`title={"Dica"}`). Por isso o `alt` vazio de imagem decorativa
é escrito `alt={""}`: `alt=""` seria acusado.

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

O teste fica em **`test/` dentro do diretório do arquivo testado**: `src/pages/Home.page.tsx` ->
`src/pages/test/Home.page.test.tsx`, nunca em `__tests__/` nem com sufixo `.spec.tsx`. O arquivo
testado é importado pelo alias `@/`, nunca por `../`. O ambiente é
`jsdom` e o setup é `src/setupTests.ts`, registrado em `test.setupFiles` do `vite.config.ts` — é
ele que registra os matchers do `jest-dom` (`toBeInTheDocument()` e companhia).

O mesmo setup reseta o idioma antes de cada teste: remove `LANGUAGE_STORAGE_KEY` do
`localStorage` e chama `i18n.changeLanguage("pt-BR")`. Assim a suíte não depende do idioma do
`jsdom` (que reporta `en-US`) nem vaza idioma de um teste para outro, e os testes afirmam o texto em
`pt-BR`, a língua de referência — não a chave, que passaria mesmo com tradução vazia. Teste que
troca o idioma usa `setLanguage` dentro do próprio `it`; `react-i18next` não é mockado.

Use `.test.ts` (sem `x`) para o que não renderiza JSX — hook, util, service.

Cada formato tem seu jeito: página renderizada direto, árvore de rotas sob um router em memória,
componente com interação (`user-event`), hook com `renderHook`, função pura e módulo com `fetch`
stubado via `vi.stubGlobal` (como em `src/services/http/test/get.test.ts`). A skill
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
