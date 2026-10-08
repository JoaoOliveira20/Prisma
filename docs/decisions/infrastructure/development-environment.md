# Ambiente de desenvolvimento

**Situação:** implementada. Passo a passo operacional também em `../../../README.md`.

## Pré-requisitos

Docker, Kool (3.x) e Node.js 20+ com yarn. PHP e Composer **não** são necessários no host (rodam nos containers).

## Serviços

| Serviço | Onde roda | Endereço |
| --- | --- | --- |
| API Laravel (nginx + PHP 8.3) | container Kool `app` | `http://localhost:8000` (`KOOL_APP_PORT`) |
| MySQL 8 | container Kool `database` | `localhost:3307` (`KOOL_DATABASE_PORT`; interno `database:3306`) |
| Frontend Next.js | host (`yarn dev`) | `http://localhost:3000` |

## Primeira execução

Backend (em `backend/`): `kool run before-start` (copia `.env.example` para `.env`), `kool start`, `kool run composer install`, `kool run artisan key:generate`, `kool run artisan storage:link`, `kool run artisan migrate --seed`.
Frontend (em `frontend/`): `cp .env.example .env.local`, `yarn install`, `yarn dev`.

## Variáveis de ambiente

-   `backend/.env` (não versionado; modelo em `backend/.env.example`): `APP_URL` (usado nas URLs de imagens enviadas), `KOOL_APP_PORT`, `KOOL_DATABASE_PORT`, `DB_*`. Os valores de `DB_*` no exemplo são **credenciais de desenvolvimento local**, não segredos de produção. `APP_LOCALE=pt_BR`.
-   `frontend/.env.local` (não versionado; modelo `frontend/.env.example`): `API_URL`.
-   Nenhum segredo deve ser versionado ou colocado no frontend.

## Tarefas do dia a dia

-   Testes do backend: `kool run phpunit` (SQLite em memória).
-   Formatação do backend: `kool run composer exec pint`.
-   Recriar dados: `kool run artisan migrate:fresh --seed` (apaga o banco; política do [ADR-008](../adr/ADR-008-pre-release-migrations.md)).
-   Verificações do frontend: `yarn lint`, `yarn tsc --noEmit`, `yarn build`.
-   Logs: `kool logs`; parar: `kool stop`.

## Armadilhas conhecidas

-   O link `backend/public/storage` aponta para `/app/storage/...` (caminho do container) e aparece quebrado no host; funciona no container.
-   `migrate:fresh` não apaga arquivos enviados em `storage/app/public`.
-   Dois `next dev` no mesmo diretório conflitam; o segundo avisa "Another next dev server is already running".
-   Ao matar processos do Next por nome, cuidado para não encerrar o próprio terminal.
