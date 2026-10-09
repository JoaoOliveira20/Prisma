# ADR-018: Cada conta é um acervo privado

-   **Data:** 2026-10-09
-   **Status:** aceita
-   **Substitui:** [ADR-007](ADR-007-content-ownership.md) (leitura para autenticados) e a parte de tags compartilhadas do [ADR-010](ADR-010-owned-controlled-tags.md). Altera o item "biblioteca de todos os usuários" do [ADR-012](ADR-012-unified-image-library.md).

## Contexto

O PRISMA é um caderno pessoal de estudo sobre arte. Pelo ADR-007, qualquer usuário autenticado lia tudo dos outros (estilos, pessoas, estratégias, referências e tags). Ao criar uma segunda conta, o responsável viu dados e tags da primeira, o oposto do que o produto pretende.

## Decisão

1.  **Cada conta só enxerga e altera os próprios dados:** estilos, pessoas, estratégias, referências, tags e grupos. Não há leitura entre contas, nem compartilhamento.
2.  **Aplicação no backend** (a interface não é barreira): trait `OwnedByUser` com *global scope* (`user_id = usuário autenticado`) nos modelos `Style`, `Person`, `Strategy`, `ReferenceItem`, `Tag` e `Group`. Isso cobre listagens, relações, `whereHas`, contagens e a resolução de rotas por slug. Registro de outra conta responde **404** (não revela que existe), em vez de 403.
3.  **Consultas cruas** (`GET /images`, que usa `UNION`) filtram `user_id` explicitamente, inclusive nas subconsultas de tags e nomes vinculados.
4.  **Validação por conta:** `tags.*` e `styles.*` só aceitam slugs que existem **na conta**; o nome de tag é único **por conta**.
5.  **Slugs e nomes por conta:** `slug` único por `(user_id, slug)` em estilos, pessoas, estratégias e tags; `name` de tag único por `(user_id, name)`. Duas contas podem ter "Bauhaus" e "Arte" sem colidir e sem sufixo `-2`.
6.  **Sem tags do sistema:** o seeder cria as tags (e todo o conteúdo de demonstração) na conta `demo@prisma.test`. Contas novas começam **vazias**, com estados vazios orientadores.
7.  **Explorar** continua sendo a tela de "ver tudo", mas **tudo o que está na conta**: estilos, imagens, pessoas e estratégias em seções, para quem não sabe o que procurar. O filtro "só o que eu criei" deixou de existir (tudo é seu).
8.  O vínculo entre conteúdos (pessoa↔estilo, referência↔conteúdo, tag↔conteúdo) só acontece **dentro da conta**.

## Justificativa

-   Atende diretamente ao propósito (anotações pessoais) e elimina uma classe de vazamento de dados.
-   O *global scope* é defesa em profundidade: um controller novo que esqueça de filtrar continua isolado.
-   404 em vez de 403 não confirma a existência de registros alheios.

## Consequências

-   **Migration** `2026_10_09_100000_scope_content_to_owner`: troca os índices únicos para `(user_id, …)` e atribui as tags que não tinham dono (as do seeder) à conta demo (ou, sem ela, ao primeiro usuário). Não há como a migration separar vínculos cruzados antigos; os que existirem apenas deixam de aparecer.
-   Em processos **sem usuário autenticado** (seeders, console, testes que não autenticam) o escopo não se aplica; por isso os seeders filtram por dono explicitamente. Usar `withoutGlobalScopes()` é a forma deliberada de ignorar o isolamento (só o gerador de slug faz isso, restrito ao próprio dono).
-   Os testes ficaram mais explícitos: dados criados para o usuário que faz a requisição; `DataIsolationApiTest` cobre o isolamento. Testes E2E que dependiam do conteúdo de demonstração entram como o usuário demo; os que criam seus próprios dados usam contas novas.
-   Os campos `can.update`/`can.delete` seguem na API, mas passam a ser sempre verdadeiros para o que a conta enxerga.
-   Sem compartilhamento: se um dia houver, será uma decisão nova (papéis, convites, leitura entre contas).

## Alternativas consideradas

-   **Filtrar só nos controllers:** mais simples, porém fácil de esquecer em um endpoint ou relação (risco de vazamento silencioso).
-   **Manter leitura compartilhada com filtro "só meus":** contraria o pedido ("só tenho acesso aos meus dados").
-   **Manter tags do sistema compartilhadas:** o responsável quer vocabulário próprio e isolado.

## Reconsiderar quando

Surgir a necessidade de compartilhar (um estilo ou coleção) com outra pessoa, ou de um administrador.
