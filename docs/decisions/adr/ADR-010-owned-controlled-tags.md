# ADR-010: Tags controladas com dono

-   **Data:** 2026-10-08
-   **Status:** aceita (a parte de tags visíveis a todos foi substituída pelo [ADR-018](ADR-018-private-workspace-per-account.md): tags são por conta)

## Contexto

`CLAUDE.md` e `../../IDEIA.md` exigem tags **controladas**, que não surgem automaticamente de qualquer texto. Até então só existiam tags de seeder, sem como o usuário criar ou ajustar o vocabulário. O responsável pediu para seguir a recomendação do agente.

## Decisão

-   Qualquer usuário autenticado **cria** tags (`POST /tags`), em tela própria; formulários de conteúdo só **escolhem** tags existentes.
-   Quem criou é o **dono** (`tags.user_id`) e é o único que **renomeia ou exclui**. Tags de seeder têm `user_id` nulo e **ninguém** as altera.
-   Uma tag **em uso** (ligada a qualquer estilo, pessoa ou estratégia) **não pode ser excluída** (HTTP 409).
-   Nomes são únicos (restrição do banco); o slug é gerado na criação e **não muda ao renomear**.

## Justificativa

Mantém o vocabulário controlado (a criação é um ato explícito, sem texto livre em formulários) sem introduzir papéis de administrador. Impedir exclusão de tag em uso evita perder classificações; manter o slug estável preserva links e filtros.

## Consequências

-   O vocabulário é **global e compartilhado**: um usuário pode poluí-lo com tags próprias que outros veem. Não há moderação.
-   Cada tag só pode ser alterada pelo criador; se ele sair, a tag fica (a chave estrangeira usa `nullOnDelete`, e a tag passa a ser "do sistema", imutável).
-   Não há mesclagem de tags.
-   A unicidade no MySQL ignora maiúsculas e acentos.

## Alternativas consideradas

-   **Só administrador gerencia tags:** exigiria criar papéis e telas de administração; não adotada por ora (apresentada ao responsável, que não a escolheu).
-   **Criar tag ao digitar no formulário:** descartada por contrariar o requisito de vocabulário controlado.

## Quando reconsiderar

Se o uso multiusuário real gerar poluição de tags, introduzir papéis e moderação (ou tags privadas por usuário).

## Referências

-   [Tags no frontend](../frontend/tags.md), [Autorização](../backend/authorization.md), [Banco de dados](../backend/database.md)
-   `backend/app/Http/Controllers/Api/TagController.php`, `backend/app/Policies/TagPolicy.php`
