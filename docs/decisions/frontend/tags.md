# Tags (frontend)

**Situação:** implementada. Decisão: [ADR-010](../adr/ADR-010-owned-controlled-tags.md). Backend: [api-structure.md](../backend/api-structure.md), [authorization.md](../backend/authorization.md).

## Objetivo

Vocabulário **controlado** para classificar estilos, pessoas e estratégias. Uma tag nunca nasce de texto digitado num formulário de conteúdo: é criada de propósito na tela de tags e depois escolhida nos formulários (`../../IDEIA.md`, `CLAUDE.md`).

## Tela `/tags` (`app/(app)/tags/page.tsx`)

-   Formulário "Nova tag" (`components/tags/CreateTagForm.tsx`): nome de até 40 caracteres; erros do servidor (nome vazio, nome já em uso) aparecem junto ao campo; sucesso mostra "Tag criada." e limpa o campo.
-   Lista em cartões (`components/tags/TagRow.tsx`): nome, número de conteúdos que usam a tag e atalhos "Estilos / Pessoas / Estratégias", que abrem a listagem filtrada por aquela tag (`?tag=slug`).
-   Para tags **do próprio usuário** aparecem: campo de renomear e botão **Excluir**. O botão fica **desabilitado** quando a tag está em uso (a API também recusa com 409). Excluir pede confirmação.
-   Tags do sistema (criadas pelo seeder) e de outros usuários aparecem como "somente leitura".
-   Item "Tags" na sidebar (`lib/navigation.ts`).

## Uso nos formulários

Os formulários de estilo, pessoa e estratégia listam todas as tags como "chips" (`components/ui/ChipCheckboxes.tsx`) e têm o link "Gerenciar tags" para esta tela.

## Pesquisa

A pesquisa global encontra tags pelo nome e leva a `/explorar?tag=slug` (ver [global-search.md](global-search.md)).

## Comportamentos a conhecer

-   Renomear **não muda o slug** (os filtros por URL continuam válidos); só o nome exibido muda.
-   A unicidade do nome é decidida pelo banco: no MySQL (collation `utf8mb4_0900_ai_ci`) é insensível a maiúsculas **e a acentos** ("Retro" colide com "Retrô"); no SQLite dos testes não é.
-   Qualquer usuário vê todas as tags, mas só o criador altera. O vocabulário é, portanto, **compartilhado entre usuários**.

## Limitações

-   Sem página própria por tag (o atalho filtra cada tipo de conteúdo separadamente).
-   Sem mesclar tags nem mover conteúdos entre tags.
-   Tags do sistema não podem ser alteradas por ninguém pela interface (só por seeder/migration).
