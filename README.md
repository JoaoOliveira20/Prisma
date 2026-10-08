# Prisma

Plataforma pessoal de referência visual, estética, artística e conceitual. Conceito em `docs/IDEIA.md`.

## Documentação

Como cada parte funciona e por que foi feita assim: [`docs/decisions/README.md`](docs/decisions/README.md).

## Estrutura

-   `backend/`: Laravel (API REST, Sanctum, MySQL) com ambiente Kool.
-   `frontend/`: Next.js (App Router), TypeScript e Tailwind CSS.
-   `docs/`: documentação e referências visuais (`docs/assets/`).

## Pré-requisitos

Docker, [Kool](https://kool.dev) e Node.js 20+. PHP e Composer rodam dentro dos containers do Kool.

## Backend

```sh
cd backend
kool run before-start
kool start
kool run composer install
kool run artisan key:generate
kool run artisan storage:link
kool run artisan migrate --seed
```

-   API: `http://localhost:8000/api` (porta definida por `KOOL_APP_PORT`).
-   MySQL exposto em `localhost:3307` (`KOOL_DATABASE_PORT`).
-   Testes: `kool run phpunit` (SQLite em memória, não afeta o MySQL).
-   `AUTH_RATE_LIMIT` (padrão 10) limita login/cadastro por minuto e `API_RATE_LIMIT` (padrão 600) as demais rotas por usuário; para os testes E2E use valores altos no `.env` (ver `docs/decisions/frontend/testing.md`).
-   Formatação: `kool run composer exec pint`.
-   Parar: `kool stop`. Recriar dados: `kool run artisan migrate:fresh --seed`.
-   Usuário de demonstração (apenas desenvolvimento): `demo@prisma.test` / `password`.

## Frontend

```sh
cd frontend
cp .env.example .env.local
yarn install
yarn dev
```

-   App: `http://localhost:3000`. `API_URL` aponta para a API Laravel.
-   Verificações: `yarn lint`, `yarn tsc --noEmit`, `yarn build`.
-   Testes ponta a ponta (backend e frontend no ar, banco com seed): `yarn playwright install chromium` (uma vez) e `yarn e2e`.

## Decisões

-   Autenticação por token Sanctum. O token fica em cookie `httpOnly` no Next.js; o navegador nunca o lê. Chamadas à API acontecem no servidor (Server Components, Server Actions e `app/api/search`).
-   Tags são controladas: criadas apenas por seeders; a API rejeita slugs inexistentes.
-   Favoritos são um grupo: cada usuário tem um grupo padrão "Favoritos" (criado sob demanda, não pode ser renomeado nem excluído) e pode criar outros. Um conteúdo pode estar em vários grupos; grupos são privados.
-   Pessoas e estratégias se relacionam com estilos (muitos-para-muitos), editados a partir da pessoa ou da estratégia.
-   Referências são vinculadas a estilos, pessoas e estratégias por relação polimórfica; só é possível vincular a conteúdos próprios. Imagens enviadas ficam em `storage/app/public/references` e são removidas ao excluir a referência. Limite de 5 MB (`serverActions.bodySizeLimit` do Next em 6 MB).
-   Estilos, pessoas e estratégias são legíveis por qualquer usuário autenticado; apenas o proprietário edita ou exclui (e adiciona referências, no caso de estilos).
-   Estilos sem imagem de capa usam o fundo `prism-light-dark.png` com a inicial do nome.
