# ADR-006: Kool como ambiente de desenvolvimento do backend

-   **Data:** 2026-10-08
-   **Status:** aceita

## Contexto

O responsável pediu Kool para o backend Laravel. Não há PHP nem Composer instalados no host.

## Decisão

O backend roda em containers gerenciados pelo Kool, a partir do preset `laravel` (`kool create laravel backend`): PHP 8.3 + nginx e MySQL 8. O frontend roda direto no host com Node e yarn, fora do Kool.

Do preset foram **removidos** Redis (cache), o serviço Node e os scripts npm/Vite, porque o Laravel aqui é só API: cache, sessão e filas usam o driver `database`.

## Justificativa

Ambiente reproduzível sem instalar PHP; o preset já traz scripts (`kool run artisan|composer|phpunit`). Remover serviços sem uso evita consumo e confusão.

## Consequências

-   Depende de Docker e do Kool instalados.
-   O `public/storage` criado no container é um link com caminho do container (`/app/...`); no host aparece quebrado, mas funciona dentro do container.
-   Se o projeto passar a precisar de filas ou cache reais, Redis terá de ser reintroduzido.

## Referências

-   [Kool](../infrastructure/kool.md), [Ambiente](../infrastructure/development-environment.md)
-   `backend/docker-compose.yml`, `backend/kool.yml`
