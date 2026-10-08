# Frontend

**Situação:** implementada. **Última verificação:** 2026-10-08.

Next.js 16 (App Router, Turbopack), React 19, TypeScript e Tailwind CSS 4, em `frontend/`, gerenciado com **yarn** (`yarn.lock`). Convenções de código: `../../FRONTEND.md`. Integração com a API: [architecture/frontend-backend-integration.md](../architecture/frontend-backend-integration.md).

## Documentos

-   [Autenticação (login e cadastro)](authentication.md)
-   [Navegação e sidebar](navigation.md)
-   [Tags](tags.md)
-   [Pesquisa global](global-search.md)
-   [Páginas de conteúdo](content-pages.md)
-   [Formulários de conteúdo](content-forms.md)
-   [Referências visuais](references.md)
-   [Grupos e favoritos](groups-and-favorites.md)
-   [Design system e identidade visual](design-system.md)
-   [Testes automatizados (E2E)](testing.md)

## Estrutura

-   `app/(auth)/login`: tela pública. `app/(app)/...`: telas autenticadas, com layout de sidebar. Rotas em português (`/estilos`, `/pessoas`, `/estrategias`, `/referencias`, `/tags`, `/grupos`, `/explorar`); identificadores de código em inglês (regra de `CLAUDE.md`).
-   `app/actions/`: Server Actions (`auth.ts`, `content.ts`, `references.ts`).
-   `app/api/`: Route Handlers para dados sob demanda no cliente: `search` (pesquisa global), `link-options` (conteúdos próprios para vincular) e `my-references` (referências do usuário).
-   `lib/`: `api.ts` (cliente), `data.ts` (leituras), `session.ts` (cookie), `form.ts` (estado de formulário e construção do multipart), `content.ts` (mapeia estilo/pessoa/estratégia para o formato do card), `navigation.ts` (itens da sidebar).
-   `components/`: por domínio (`content`, `references`, `groups`, `people`, `strategies`, `styles`, `search`, `layout`, `auth`, `brand`) e `ui` (botões, campos, abas, etc.).
-   `types/api.ts`: tipos que espelham a API (mantidos à mão).
-   `proxy.ts`: proteção de rotas (o "middleware" do Next 16).

## Convenções adotadas

-   **Server Components por padrão.** Componentes de cliente (`"use client"`) apenas onde há estado, efeitos ou APIs do navegador: sidebar, paleta de pesquisa, formulários, abas, galeria/lightbox, botões de favorito e de grupo.
-   Modais usam o elemento nativo `<dialog>` (foco e `Esc` gratuitos), sem biblioteca; **não se usa `window.confirm`**: confirmações são `ConfirmDialog`.
-   Estados de **carregamento** (`app/(app)/loading.tsx`), **erro** (`error.tsx`) e **não encontrado** (`not-found.tsx`) são globais ao grupo `(app)`.
-   Sem biblioteca de componentes nem de ícones; ícones são SVG inline (`components/layout/NavIcon.tsx`, `components/brand/PrismMark.tsx`).
-   Testes E2E com Playwright (`yarn e2e`; ver [testing.md](testing.md)); sem testes unitários de componentes.
-   Formulários que chamam Server Actions usam `components/ui/Form.tsx`, que dispara a action sem o **reset automático** do React 19 (que apagava o digitado quando o servidor devolvia erro). Use-o em todo formulário novo com validação no servidor.
-   Listagens paginadas por `?page=` (componente `components/ui/Pagination.tsx`); `lib/data.ts` expõe `get*Page` (com `meta`) e `get*` (só os itens).

## Configuração relevante (`frontend/next.config.ts`)

-   `cacheComponents`/`partialPrefetching` **desligados** (ver [ADR-003](../adr/ADR-003-frontend-backend-integration.md)).
-   `experimental.serverActions.bodySizeLimit = "6mb"` para uploads.
-   Cabeçalhos de segurança em todas as rotas (`headers()`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` sem câmera/microfone/localização. **Não há Content-Security-Policy.**
-   Regra do Turbopack que aplica o loader `@tailwindcss/turbopack` ao CSS (gerada pelo scaffold, mantida).
-   `frontend/AGENTS.md` é gerado pelo Next e avisa que esta versão tem mudanças em relação ao conhecimento comum: **consulte `node_modules/next/dist/docs/` antes de usar APIs do Next**.

## Comandos

`yarn dev`, `yarn build`, `yarn lint`, `yarn tsc --noEmit`, `yarn e2e`. Variável: `API_URL` em `.env.local`.
