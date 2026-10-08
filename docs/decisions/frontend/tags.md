# Tags (frontend)

**Situação:** implementada. Decisão: [ADR-010](../adr/ADR-010-owned-controlled-tags.md). Backend: [api-structure.md](../backend/api-structure.md), [authorization.md](../backend/authorization.md).

## Objetivo

Vocabulário **controlado** para classificar estilos, pessoas e estratégias. Uma tag nunca nasce de texto digitado num formulário de conteúdo: é criada de propósito na tela de tags e depois escolhida nos formulários (`../../IDEIA.md`, `CLAUDE.md`).

## Tela `/tags` (`app/(app)/tags/page.tsx`)

Um **índice tipográfico do vocabulário**, em duas colunas em telas largas, na linguagem editorial ([ADR-013](../adr/ADR-013-editorial-archive-direction.md)):

-   Cabeçalho "Vocabulário · Tags" e, numa faixa entre filetes, o formulário "Nova tag" (`CreateTagForm`): nome de até 40 caracteres; erros do servidor junto ao campo; sucesso mostra "Tag criada." e limpa o campo.
-   Cada tag é uma linha (`TagRow`) com o nome em serifa grande, "N conteúdos" e atalhos "Estilos / Pessoas / Estratégias" (a listagem filtrada por aquela tag, `?tag=slug`).
-   Para tags **do próprio usuário**: ações em texto **Renomear** (troca o nome por um campo inline com Salvar/Cancelar) e **Excluir** (confirmação em modal; **desabilitado** quando a tag está em uso, e a API também recusa com 409).
-   Tags do sistema (criadas pelo seeder) e de outros usuários mostram "somente leitura" e não têm ações.
-   Item "Tags" no grupo "Vocabulário" da sidebar.

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
