# Autorização e propriedade

**Situação:** implementada. Decisão: [ADR-007](../adr/ADR-007-content-ownership.md).

## Regras

| Recurso | Ler | Criar | Editar / excluir |
| --- | --- | --- | --- |
| Estilo, Pessoa, Estratégia | qualquer autenticado | qualquer autenticado (vira dono) | só o dono |
| Referência | qualquer autenticado | autenticado, vinculando só a conteúdos próprios | só o dono |
| Grupo | só o dono | dono | só o dono, exceto o grupo Favoritos (nunca) |
| Tags | qualquer autenticado | qualquer autenticado (vira dono) | só o dono; tags de seeder (sem dono) ninguém; tag em uso não exclui ([ADR-010](../adr/ADR-010-owned-controlled-tags.md)) |

## Implementação

-   Policies em `app/Policies/` (`StylePolicy`, `PersonPolicy`, `StrategyPolicy`, `ReferenceItemPolicy`, `GroupPolicy`, `TagPolicy`), descobertas por convenção de nome.
-   Controllers chamam `$this->authorize(...)`; o trait `AuthorizesRequests` foi adicionado ao `Controller` base porque o Laravel 13 não o inclui.
-   O dono vem sempre do usuário autenticado (`$request->user()->styles()->create(...)`). Nenhum endpoint aceita `user_id` do cliente.
-   Os Resources devolvem `can: { update, delete }` por item para o frontend esconder ações indevidas. **O frontend não é barreira de segurança**: a API valida em cada operação.
-   `GroupPolicy::update/delete` negam o grupo `is_favorites`. `view` exige ser o dono (também usado para adicionar/remover itens).

## Pontos de atenção

-   Vincular uma referência exige `update` sobre **cada** conteúdo vinculado (`ReferenceItemController@store/update`).
-   Pessoas e estratégias aceitam vínculo a **qualquer** estilo existente (apenas valida que o slug existe).
-   Não há papéis administrativos nem compartilhamento. Introduzi-los exige revisar as Policies e as consultas de listagem.
