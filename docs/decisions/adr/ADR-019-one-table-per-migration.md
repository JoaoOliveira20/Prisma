# ADR-019: Uma migration por tabela e histórico imutável

-   **Data:** 2026-10-09
-   **Status:** aceita
-   **Substitui:** [ADR-008](ADR-008-pre-release-migrations.md) (migrations editadas no lugar).

## Contexto

Três migrations criavam várias tabelas sem necessidade (`reference_items`+`referenceables`, `groups`+`group_items` e quatro vínculos em `content_relation_tables`), o arquivo `create_reference_tag_table` criava a tabela `reference_item_tag`, e os vínculos estavam espalhados (alguns com arquivo próprio, outros não). Além disso, com contas reais no banco, a política de editar migrations no lugar deixou de ser segura.

## Decisão

1.  **Uma migration por tabela criada**, com o nome do arquivo igual ao da tabela (`create_<tabela>_table`). Exceção: os arquivos padrão do Laravel (`users`, `cache`, `jobs`), que seguem como vieram.
2.  **Uma migration por alteração lógica** depois da criação. Migrations já aplicadas não são editadas; mudar o banco exige migration nova.
3.  **Ordem:** tabelas principais primeiro, vínculos depois (cada vínculo roda depois das duas tabelas que referencia), alterações por último. Os vínculos têm horários sequenciais (`120301` a `120308`).
4.  A reorganização feita em 2026-10-09 (o último momento em que se permitiu reescrever o histórico) **não mudou o esquema**: comparado coluna a coluna, índice a índice e chave a chave com o banco existente (23 tabelas), o resultado é idêntico. No banco de desenvolvimento só os nomes na tabela `migrations` foram atualizados, sem tocar nos dados.

## Justificativa

Um arquivo por tabela facilita achar, ler e reverter cada mudança. Histórico imutável evita que ambientes diferentes divirjam e que o Laravel tente recriar tabelas existentes (ele identifica migrations pelo nome do arquivo).

## Consequências

-   Quem tem um banco local migrado **antes** desta reorganização precisa atualizar a tabela `migrations` (trocar os nomes antigos pelos novos) ou recriar o banco com `migrate:fresh --seed`.
-   Correção incluída: o `down()` de `scope_content_to_owner` falhava no MySQL (o índice composto passou a sustentar a chave estrangeira de `user_id`). Agora recria um índice simples antes de remover o composto. O `up()` não mudou. Todas as migrations foram revertidas e reaplicadas com sucesso em um banco temporário.
-   Primeira migration sob a nova convenção: `2026_10_09_110000_make_tags_user_required` torna `tags.user_id` `NOT NULL` com `cascadeOnDelete` (toda tag tem dono desde o ADR-018, e antes o usuário apagado deixaria tags órfãs e invisíveis). Verificada em MySQL (`up` e `down`) e coberta por teste.

## Alternativas consideradas

-   **Deixar o histórico como estava:** zero risco, mas mantém arquivos confusos e uma política (editar no lugar) que não vale mais.
-   **`migrate:fresh`:** descartaria os dados sem necessidade; a troca de nomes na tabela `migrations` preservou tudo.

## Reconsiderar quando

Houver implantação em servidor: a partir daí o histórico fica congelado de verdade, sem reescritas.
