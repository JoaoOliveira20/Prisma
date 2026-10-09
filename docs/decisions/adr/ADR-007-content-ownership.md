# ADR-007: Leitura para autenticados, escrita só do dono

-   **Data:** 2026-10-08
-   **Status:** substituída pelo [ADR-018](ADR-018-private-workspace-per-account.md) (cada conta passou a ver só os próprios dados)

## Contexto

`CLAUDE.md`: "conteúdos pessoais pertencem ao usuário que os criou; somente usuários autorizados podem alterá-los". `../../IDEIA.md` prevê compartilhamento no futuro, sem implementá-lo agora. Os estilos de demonstração pertencem a um usuário demo e precisam ser visíveis a quem se cadastra.

## Decisão

-   **Estilos, pessoas, estratégias e referências:** qualquer usuário autenticado lê; só o dono edita ou exclui (Policies).
-   **Vínculos:** só é possível vincular uma referência a conteúdos que o próprio usuário possui; pessoas e estratégias vinculam a quaisquer estilos (a relação pertence a quem edita a pessoa/estratégia).
-   **Grupos:** privados ao dono, inclusive leitura.
-   **Tags:** qualquer autenticado cria; só o criador altera ([ADR-010](ADR-010-owned-controlled-tags.md)).
-   Sem papéis (admin) e sem compartilhamento seletivo.

## Justificativa

Atende ao requisito de propriedade com o mínimo de regras e torna o conteúdo de demonstração útil. Impedir vínculos a conteúdos alheios evita que um usuário injete referências na página de outro.

## Consequências

-   Todo usuário vê todo o conteúdo dos outros: **não há conteúdo privado** para estilos/pessoas/estratégias. Se isso mudar (conteúdo privado por padrão), é uma mudança de modelo de dados e de todas as consultas de listagem.
-   Um estilo cadastrado por um usuário pode ser vinculado por outro a pessoas/estratégias dele (a relação aparece na página do estilo).
-   Não existe moderação.

## Referências

-   [Autorização](../backend/authorization.md)
-   `backend/app/Policies/`
