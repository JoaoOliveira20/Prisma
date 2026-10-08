# ADR-012: Biblioteca de imagens como consulta unificada

-   **Data:** 2026-10-08
-   **Status:** aceita

## Contexto

O responsável quis uma página que mostre as **imagens do sistema independentemente do estilo**, com descrição e filtros, incluindo as capas e fotos que já existem, não só as referências adicionadas. Imagens vivem em quatro tabelas (`reference_items`, `styles`, `people`, `strategies`), com colunas diferentes.

## Decisão

`GET /images` monta, com **`UNION ALL` no banco**, uma lista única (`kind`, título, descrição, imagem, data) e a pagina como um conjunto. Depois hidrata só as referências da página (`ReferenceItemResource`, com vínculos, favorito e grupos) e devolve os demais tipos em formato enxuto. Filtros por origem, texto, estilo relacionado e "só os meus" são aplicados em cada ramo da união.

## Justificativa

Uma tabela física de imagens exigiria migrar capas e fotos e duplicar a fonte de verdade. Mesclar em PHP quebraria a paginação. A união no banco mantém paginação e ordenação corretas, sem mudar o esquema.

## Consequências

-   Qualquer coluna nova de imagem em outro tipo de conteúdo exige acrescentar um ramo em `ImageController`.
-   A consulta usa SQL cru (`selectRaw`), validado em MySQL e SQLite; as colunas dos ramos precisam manter a mesma ordem e tipo.
-   Sem índice específico: custo cresce com o tamanho das quatro tabelas (aceitável para uso pessoal).
-   Imagens de estilos/pessoas/estratégias aparecem na biblioteca mas só podem ser editadas na página do conteúdo.

## Alternativas consideradas

-   **Tabela única de imagens** com migração das capas: descartada por ora (maior mudança de modelo). Não discutida com o responsável.
-   **Várias consultas e mistura em PHP:** descartada pela paginação.

## Referências

-   [Referências no frontend](../frontend/references.md), [API](../backend/api-structure.md)
-   `backend/app/Http/Controllers/Api/ImageController.php`
