# ADR-003: Chamadas à API somente pelo servidor do Next.js

-   **Data:** 2026-10-08
-   **Status:** aceita

## Contexto

`../../FRONTEND.md` pede Server Components por padrão, Client Components só quando necessário, e nenhum segredo no frontend. A API Laravel está em outra origem.

## Decisão

Leituras em Server Components, mutações em Server Actions e interações de cliente por Route Handlers (hoje só `/api/search`). O navegador não chama o Laravel.

## Justificativa

Mantém o token fora do navegador (ADR-001), elimina CORS e aproveita o modelo do App Router. Páginas chegam renderizadas com os dados.

## Consequências

-   Um salto extra por requisição.
-   `revalidatePath("/", "layout")` após mutações (simples e correto, mas invalida mais do que o necessário).
-   Os tipos TypeScript são mantidos à mão.
-   Uploads precisam de `serverActions.bodySizeLimit` ampliado.
-   `cacheComponents` e `partialPrefetching` (ativados pelo scaffold) foram **desligados**: o app é inteiramente por usuário e dinâmico, e a renderização estática exigiria `Suspense` em todas as páginas sem ganho.

## Alternativas consideradas

Chamadas diretas do navegador com CORS: descartada por segurança do token. Não foi discutida com o responsável.

## Referências

-   [Integração](../architecture/frontend-backend-integration.md)
