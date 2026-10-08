# Grupos e favoritos (frontend)

**Situação:** implementada. Decisão: [ADR-004](../adr/ADR-004-favorites-as-groups.md). Backend: [backend/groups-and-favorites.md](../backend/groups-and-favorites.md).

## Conceito na interface

Favoritos **são um grupo**: o grupo padrão "Favoritos" de cada usuário. Não existe página `/favoritos` nem item de menu próprio.

## Telas e componentes

-   **`/grupos`** (`app/(app)/grupos/page.tsx`): cartões dos grupos (Favoritos sempre primeiro, marcado como "grupo padrão"), com a contagem de itens, e formulário "Novo grupo" (`components/groups/CreateGroupForm.tsx`). Referência: "08 grupos colecoes".
-   **`/grupos/[id]`**: itens do grupo em seções por tipo (Estilos, Pessoas, Estratégias, Referências), usando `ContentGrid` e, para referências, `ReferenceGallery`. Para grupos que não são Favoritos mostra `GroupSettings` (renomear e excluir, com confirmação). Estado vazio orienta a usar "Salvar em grupo".
-   **Coração** (`components/content/FavoriteButton.tsx`): nos cards, nos detalhes e no lightbox de referências (tipo `GroupableType` = estilo, pessoa, estratégia ou referência). Atualização **otimista** (`useOptimistic`) e depois Server Action `setFavorite` → `POST/DELETE /favorites/{type}/{slug}`.
-   **"Salvar em grupo"**: item do menu "⋯" dos detalhes (e do lightbox de referências) que abre o modal `components/content/GroupModal.tsx` com uma caixa por grupo; marcar/desmarcar chama `setGroupMembership` (otimista). Os grupos vêm de `getGroups()` e os marcados de `group_ids` do item.
-   **Início:** a seção "Favoritos" lê o grupo Favoritos (`getGroup`) e mostra até 4 itens.

## Decisões

-   Atualização otimista no coração e no menu: a resposta visual é imediata; em caso de falha a interface volta ao estado do servidor na revalidação seguinte.
-   Server Actions invalidam o layout inteiro (`revalidatePath("/", "layout")`) para manter o coração coerente em todas as listas.

## Limitações

-   Não há como arrastar/ordenar itens nem mover entre grupos.
-   Referências usam o id como identificador nas ações (`type="reference"`, `slug=String(id)`), diferente dos demais tipos.
-   Sem tratamento visual de falha da ação otimista além do retorno ao estado do servidor.
