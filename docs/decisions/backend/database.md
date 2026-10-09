# Banco de dados e modelos

**Situação:** implementada. MySQL 8 (SQLite em memória nos testes). Decisões: [ADR-004](../adr/ADR-004-favorites-as-groups.md), [ADR-005](../adr/ADR-005-polymorphic-references.md), [ADR-008](../adr/ADR-008-pre-release-migrations.md).

## Tabelas

| Tabela | Conteúdo principal |
| --- | --- |
| `users`, `personal_access_tokens` | Usuários e tokens Sanctum |
| `styles` | `user_id`, `name`, `slug`, `summary`, `history`, `influences`, `characteristics` (JSON), `period`, `origin`, `cover_url`, `image_path` |
| `people` | `user_id`, `name`, `slug`, `role`, `summary`, `biography`, `period`, `origin`, `photo_url`, `image_path` |
| `strategies` | `user_id`, `name`, `slug`, `category`, `summary`, `description`, `cover_url`, `image_path` |
| `reference_items` | `user_id`, `title`, `description`, `image_url` (nulável), `image_path`, `source_url`, `credit` |
| `tags` | `user_id` (dono), `name`, `slug`, únicos **por conta** (`user_id`+`name`, `user_id`+`slug`) |
| `style_tag`, `person_tag`, `strategy_tag` | Tags de cada tipo (pivôs com chave composta) |
| `person_style`, `strategy_style` | Pessoas e estratégias ↔ estilos |
| `styles`, `people`, `strategies` | `slug` único por conta (`user_id`+`slug`), não global (migration `2026_10_09_100000`) |
| `reference_item_tag` | Tags próprias das imagens ([ADR-015](../adr/ADR-015-reference-tags-and-explicit-links.md)); migration aditiva |
| `referenceables` | Referência ↔ estilo/pessoa/estratégia (polimórfica) |
| `groups`, `group_items` | Grupos por usuário; itens polimórficos |
| `jobs`, `sessions`* (e `cache`, sem uso) | Padrão do Laravel; sessão e filas com driver `database`. O **cache usa arquivo** (`CACHE_STORE=file`) |

\* O driver de sessão está configurado como `database`, mas o app é API sem sessão.

## Relacionamentos (Eloquent)

-   `User` tem muitos `styles`, `people`, `strategies`, `referenceItems`, `groups`. `User::favoritesGroup()` devolve (criando se preciso) o grupo Favoritos.
-   `Style` ↔ `Tag`, `Person`, `Strategy` (muitos-para-muitos); `Style`, `Person`, `Strategy` ↔ `ReferenceItem` por `references()` (trait `HasReferences`); todos têm `groupItems()` (trait `Groupable`).
-   `ReferenceItem` tem `styles()`, `people()`, `strategies()` (`morphedByMany`).
-   `ReferenceItem` também usa `Groupable`, então pode ser favoritada e colocada em grupos.
-   **Morph map obrigatório** (`AppServiceProvider`): `style`, `person`, `strategy`, `reference`, `user`. Esses nomes são gravados nas colunas `*_type` e usados nas URLs. `user` é necessário porque o Sanctum grava o tipo do dono do token.
-   Chaves estrangeiras com `cascadeOnDelete` nas relações diretas. Para as polimórficas (sem FK possível), os traits removem os vínculos no evento `deleting`: `groupItems()->delete()` e `references()->detach()`. A **referência** em si sobrevive à exclusão do conteúdo vinculado.

## Traits de modelo (`app/Models/Concerns/`)

-   `HasUniqueSlug`: gera o slug na criação e usa `slug` como chave de rota.
-   `Groupable`: relação com `group_items`, escopo `withFavoriteFlag`, `loadFavoriteFlag`, `loadGroupIds`.
-   `Searchable`: escopo `matching` ([API](api-structure.md), seção Busca).
-   `HasReferences`, `HasUploadedImage`: ver [armazenamento de imagens](image-storage.md).

## Tags controladas

Cada conta cria e gerencia as próprias tags pela tela de tags ([ADR-010](../adr/ADR-010-owned-controlled-tags.md), [ADR-018](../adr/ADR-018-private-workspace-per-account.md)); o `TagSeeder` cria as 12 tags de demonstração **na conta demo**; estilos, pessoas e estratégias só aceitam slugs de tags existentes. A unicidade de `name` no MySQL ignora maiúsculas e acentos.

## Seeders

`DatabaseSeeder` chama `TagSeeder`, `StyleSeeder`, `PersonSeeder`, `StrategySeeder` e `ReferenceSeeder`, idempotentes (busca por nome/título); um teste roda o seed duas vezes e confere as contagens. Criam o usuário `demo@prisma.test` (senha de desenvolvimento publicada em `README.md`, **nunca usar fora do ambiente local**). Os textos de demonstração são resumos redigidos pelo agente a partir de conhecimento geral, **não revisados contra fontes**; revise antes de tratá-los como conteúdo definitivo. **Imagens de demonstração:** estilos e estratégias recebem uma capa e cada estilo do usuário demo ganha uma referência, todas **arte original em SVG** criada para o projeto (`backend/database/seeders/images/`, sem direitos de terceiros), copiadas para o disco público como `seed-<slug>.svg` e gravadas em `image_path`. Pessoas não têm foto de demonstração (usam o fallback visual). São imagens de exemplo, não conteúdo definitivo.

## Migrations

Política atual: migrations existentes são editadas e o banco recriado com `kool run artisan migrate:fresh --seed` ([ADR-008](../adr/ADR-008-pre-release-migrations.md)). Isso acaba quando houver dados a preservar.

## Limitações

-   A unicidade do grupo Favoritos por usuário não é garantida por índice: `favoritesGroup()` usa um **lock de cache** (`Cache::lock`, no cache de arquivo) para evitar duplicação em requisições simultâneas.
-   Busca por `LIKE` sem índice de texto.
