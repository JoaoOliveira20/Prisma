# Autorização e propriedade

**Situação:** implementada. Decisão vigente: [ADR-018](../adr/ADR-018-private-workspace-per-account.md) (substitui o ADR-007).

## Regras

Cada conta enxerga e altera **somente os próprios dados** ([ADR-018](../adr/ADR-018-private-workspace-per-account.md)):

| Recurso | Ler | Criar | Editar / excluir |
| --- | --- | --- | --- |
| Estilo, Pessoa, Estratégia, Referência, Tag | só o dono (registro de outra conta responde 404) | autenticado (vira dono) | só o dono; tag em uso não exclui |
| Grupo | só o dono | dono | só o dono, exceto o grupo Favoritos (nunca) |

## Implementação

-   **Isolamento por conta:** trait `OwnedByUser` (*global scope* por `user_id` do usuário autenticado) em `Style`, `Person`, `Strategy`, `ReferenceItem`, `Tag` e `Group`. Consultas cruas (`GET /images`) filtram `user_id` à mão. Fora de requisições autenticadas (seeders, console) o escopo não existe, então esses códigos filtram por dono explicitamente.
-   Policies em `app/Policies/` (`StylePolicy`, `PersonPolicy`, `StrategyPolicy`, `ReferenceItemPolicy`, `GroupPolicy`, `TagPolicy`), descobertas por convenção de nome.
-   Controllers chamam `$this->authorize(...)`; o trait `AuthorizesRequests` foi adicionado ao `Controller` base porque o Laravel 13 não o inclui.
-   O dono vem sempre do usuário autenticado (`$request->user()->styles()->create(...)`). Nenhum endpoint aceita `user_id` do cliente.
-   Os Resources devolvem `can: { update, delete }` por item para o frontend esconder ações indevidas. **O frontend não é barreira de segurança**: a API valida em cada operação.
-   `GroupPolicy::update/delete` negam o grupo `is_favorites`. `view` exige ser o dono (também usado para adicionar/remover itens).

## Pontos de atenção

-   Vínculos só existem dentro da conta: slugs de tags e estilos são validados **na conta** (`Rule::exists(...)->where('user_id', …)`), e o `GroupItem::resolveGroupable` só encontra registros do usuário.
-   Como o escopo vale também para quem tem Policy, o caminho normal para registro alheio é 404; 403 só aparece em regras como "Favoritos não pode ser renomeado".
-   Não há papéis administrativos nem compartilhamento. Introduzi-los exige revisar as Policies e as consultas de listagem.
