# Grupos e favoritos (backend)

**Situação:** implementada. Decisão: [ADR-004](../adr/ADR-004-favorites-as-groups.md). Lado da interface: [frontend/groups-and-favorites.md](../frontend/groups-and-favorites.md).

## Modelo

-   `groups`: `user_id`, `name` (único por usuário), `is_favorites`.
-   `group_items`: `group_id`, `groupable_type`/`groupable_id` (`style`, `person`, `strategy`, `reference`), único por trio. Para referências o identificador na API é o **id** (as demais usam slug); `GroupItem::resolveGroupable` usa a chave de rota de cada modelo.
-   Todo usuário tem, no máximo, um grupo com `is_favorites = true`, criado por `User::favoritesGroup()` na primeira necessidade (listar grupos ou favoritar).

## Endpoints e comportamento

-   `GET /groups`: lista do usuário, Favoritos primeiro, com `items_count` e **`previews`** (até 4 URLs de imagem dos itens mais recentes, para o mosaico da interface; itens sem imagem são ignorados). Cria o grupo Favoritos se ainda não existir.
-   `GET /groups/{id}`: devolve o grupo e seus itens separados em `styles`, `people`, `strategies` e `references` (uma consulta por tipo, com tags/vínculos, `is_favorite` e, nas referências, `group_ids`).
-   `POST /groups`, `PUT /groups/{id}`, `DELETE /groups/{id}`: criar, renomear, excluir. Favoritos não pode ser renomeado nem excluído (403). Excluir um grupo não exclui os conteúdos.
-   `POST /groups/{id}/items` (`type`, `slug`) e `DELETE /groups/{id}/items/{type}/{slug}`: adicionar (idempotente) e remover.
-   `POST/DELETE /favorites/{type}/{slug}`: atalho que opera no grupo Favoritos do usuário.
-   Sempre só o dono acessa o grupo (`GroupPolicy`); itens são resolvidos por `GroupItem::resolveGroupable`, que responde 404 para tipo desconhecido.

## Sinalizadores por usuário nos Resources

-   `is_favorite`: escopo `withFavoriteFlag` (listas) ou `loadFavoriteFlag` (detalhe) consultam se o item está no grupo Favoritos do usuário.
-   `group_ids`: no detalhe de estilo, pessoa e estratégia e, para referências, também nas listas (carregado por `groupItems` restrito aos grupos do usuário); ids dos grupos do usuário que contêm o item (usado pelo menu "Salvar em grupo").

## Limitações

-   Excluir um conteúdo remove seus itens de grupo (evento `deleting` do trait `Groupable`).
-   Unicidade de Favoritos por usuário garantida pela aplicação (lock de cache em `favoritesGroup()`), não por índice.
-   Sem ordenação manual dos itens; itens ordenados por nome dentro de cada tipo.
