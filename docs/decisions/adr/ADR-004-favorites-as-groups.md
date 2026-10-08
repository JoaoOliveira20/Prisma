# ADR-004: Favoritos modelados como um grupo

-   **Data:** 2026-10-08
-   **Status:** aceita
-   **Substitui:** primeira implementação, uma tabela `favorites` própria (polimórfica) com rota `/favoritos`.

## Contexto

`../../IDEIA.md` lista Favoritos e Grupos como conceitos separados. A primeira implementação seguiu isso literalmente e só favoritava estilos. O responsável pediu que **os favoritos fiquem dentro de grupos**.

## Decisão

-   Existe uma única estrutura: `groups` + `group_items` (polimórfica).
-   Cada usuário tem um grupo padrão **Favoritos** (`is_favorites = true`), criado sob demanda por `User::favoritesGroup()`. Não pode ser renomeado nem excluído.
-   Favoritar = incluir o conteúdo nesse grupo (`/api/favorites/{type}/{slug}`). O coração nos cards e o menu "Salvar em grupo" operam sobre a mesma tabela.
-   A tabela e a rota antigas foram removidas.

## Justificativa

Evita duas estruturas quase idênticas; um conteúdo pode estar em vários grupos; favoritos passam a funcionar para estilos, pessoas e estratégias sem código adicional.

## Consequências

-   "É favorito?" é uma consulta ao grupo (escopo `withFavoriteFlag`), não um campo.
-   Unicidade de `is_favorites` por usuário é garantida só pela aplicação (`favoritesGroup()`), não por índice no banco; duas requisições simultâneas na primeira criação poderiam duplicar o grupo (risco baixo, não tratado).
-   Grupos são privados ao dono.
-   Referências também podem ser favoritadas e agrupadas (tipo `reference`, identificadas por id); a decisão original não previa isso (acrescentado em 2026-10-08, sem alterar a decisão).

## Referências

-   [Backend](../backend/groups-and-favorites.md), [Frontend](../frontend/groups-and-favorites.md)
-   `backend/app/Models/Group.php`, `backend/app/Http/Controllers/Api/FavoriteController.php`
