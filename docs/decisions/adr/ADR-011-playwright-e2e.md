# ADR-011: Testes ponta a ponta do frontend com Playwright

-   **Data:** 2026-10-08
-   **Status:** aceita

## Contexto

O frontend só tinha lint, tipos e build. A interface concentra lógica que os testes do backend não veem (Server Actions, formulários, cookies, redirecionamentos, diálogos). Faltava também uma forma de **ver** o app renderizado e conferir fluxos reais. `CLAUDE.md` pede cautela com dependências novas; há necessidade concreta.

## Decisão

Adotar **`@playwright/test`** como dependência de desenvolvimento e escrever testes E2E em `frontend/e2e/`, executados contra a pilha completa (Next + Laravel + MySQL). Não adotar, por ora, testes unitários de componentes.

## Justificativa

Os riscos mais prováveis (fluxo de login, formulários, persistência, permissões visíveis na interface, upload) só aparecem integrados. Os testes já revelaram defeitos reais (formulários que perdiam o digitado após erro de validação; corações de itens relacionados sempre vazios).

## Consequências

-   Dependência de desenvolvimento pesada (download do Chromium) e requisitos de sistema (bibliotecas do navegador; ver [testing.md](../frontend/testing.md)).
-   Os testes dependem do banco com seed e de um limite alto de tentativas de login (`AUTH_RATE_LIMIT`).
-   Sem integração contínua: precisam ser rodados manualmente (`yarn e2e`).
-   Dados de teste permanecem no banco local.

## Alternativas consideradas

-   **Vitest + Testing Library:** não cobrem Server Actions e cookies de forma realista; descartada por ora. Não foi discutida com o responsável.
-   **Só verificação manual:** descartada por regressões silenciosas.

## Referências

-   [Testes do frontend](../frontend/testing.md)
-   `frontend/playwright.config.ts`, `frontend/e2e/`
