# Kool

**Situação:** implementada. Decisão: [ADR-006](../adr/ADR-006-kool-development-environment.md).

## Como foi criado

`kool create laravel backend` (preset oficial `laravel`, PHP 8.3, MySQL 8.0). O preset gera `backend/docker-compose.yml`, `backend/kool.yml` e o projeto Laravel. As escolhas de Redis e npm do assistente foram aceitas e depois removidas (veja abaixo).

## Ajustes sobre o preset

-   **Removidos** do `docker-compose.yml`: serviços `cache` (Redis) e `node`, e o volume `cache`; removida a chave obsoleta `version`.
-   **Removidos** do `kool.yml`: scripts `npm`/`npx` e a instalação de dependências JS; `before-start` usa `cp -n` para não sobrescrever o `.env`.
-   **Removidos** do projeto: `package.json`, `vite.config.js`, `resources/js|css|views` e os arquivos `AGENTS.md`/`CLAUDE.md`/`README.md` do esqueleto Laravel (as regras do repositório estão no `CLAUDE.md` da raiz).
-   `.env.example`: `APP_NAME=Prisma`, `APP_LOCALE=pt_BR`, MySQL (`DB_HOST=database`, base `prisma`), portas `KOOL_APP_PORT=8000` e `KOOL_DATABASE_PORT=3307`.

## Scripts (`backend/kool.yml`)

`kool run artisan …`, `composer …`, `phpunit`, `mysql` (cliente), `setup`, `reset`, `before-start`. Comandos do Kool usados: `kool start|stop|status|logs`, `kool run`. Documentação oficial: https://kool.dev/docs.

## Observações

-   Imagem PHP: `kooldev/php:8.3-nginx` (nginx e PHP-FPM no mesmo container).
-   O `docker-compose.yml` usa a rede externa `kool_global`, criada pelo Kool.
-   O script `setup` do preset não executa `storage:link` nem `migrate`; siga a sequência de [development-environment.md](development-environment.md).
-   O frontend **não** está no Kool (roda no host).
