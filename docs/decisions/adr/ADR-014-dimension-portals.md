# ADR-014: Dimensões como conteúdo, portais ou relações

-   **Data:** 2026-10-08
-   **Status:** aceita
-   **Substitui (parcialmente):** o trecho do [ADR-013](ADR-013-editorial-archive-direction.md) que colocava **todas** as dimensões, completas, na página de detalhe.

## Contexto

Os detalhes mostravam História, Características, Influências, Pessoas, Estratégias e Referências no mesmo nível, todas carregadas por inteiro. Isso não escala: um estilo com 100 referências (ou 1.000) traria uma página imensa e lenta, e a biblioteca de imagens, que é o repertório do produto, ficaria sufocada dentro de um detalhe. O responsável também apontou que as cinco entradas do índice não têm a mesma natureza.

## Decisão

Classificar cada conceito e dar a ele o tratamento correspondente:

| Conceito | Natureza | Tratamento |
| --- | --- | --- |
| História, Características, Influências | conteúdo editorial do estilo (campos do próprio registro) | uma seção única **Sobre o estilo** (história em coluna larga; características numeradas e influências ao lado). O índice fixo não lista cada um |
| Pessoas, Estratégias | entidades próprias, coleções que crescem | **portal**: prévia (6 pessoas, 5 estratégias) + "Ver as N …" levando a `/pessoas?style=slug` e `/estrategias?style=slug` |
| Referências | coleção visual que cresce sem limite | **portal com página própria**: 8 mais recentes + "Ver todas as N referências" (e o item "Referências →" do índice) levam a `/estilos/[slug]/referencias` (idem `/pessoas/…` e `/estrategias/…`): só imagens, sem o conteúdo editorial |
| Estilos relacionados | relação derivada (tags em comum) | até 3, direto na página |
| Tags | metadado controlado | texto no cabeçalho; página própria permanece em `/tags` |
| Influências | **texto livre**, não relação | continua campo de texto; só virará relação navegável se houver necessidade confirmada |

A página de referências do conteúdo tem trilha (Estilos / Bauhaus / Referências), busca, botão de adicionar (para o dono), contagem, mosaico e paginação; usa `GET /images` com `kind=reference` e o filtro do dono. A biblioteca geral `/referencias` continua aceitando `style`, `person` e `strategy`. As listas de pessoas e estratégias filtradas por estilo mostram uma faixa de contexto ("Filtrando por estilo: Bauhaus", com "Abrir estilo" e "Remover filtro") e preservam o filtro em busca, ordenação, tags e paginação.

A API entrega, no detalhe, **só a prévia** e a contagem total (`references_count`, `people_count`, `strategies_count`). `GET /people` e `GET /strategies` aceitam `style`; `GET /images` aceita `person` e `strategy` (que limitam o resultado a referências) além de `style`.

## Justificativa

-   O detalhe continua uma página editorial agradável com 10 ou 10.000 referências: o custo é constante.
-   O índice deixa de misturar texto do estilo com coleções; cada item do índice é um lugar diferente.
-   Reaproveita as listas existentes (`ContentBrowser`, `/referencias`) em vez de criar páginas aninhadas como `/estilos/x/referencias`; menos telas e um só lugar para filtrar.
-   O ponto de partida é uma consulta com filtro, então a mesma tela serve de entrada a partir de estilo, pessoa ou estratégia ("uma coisa → várias dimensões").

## Consequências

-   Há duas formas de ver referências de um estilo (a página própria e a biblioteca filtrada); a página própria é o caminho da interface.
-   O lightbox do detalhe navega só pelas imagens da prévia; para percorrer todas, é preciso abrir a lista filtrada.
-   Não há ordenação customizada da prévia: são as mais recentes (limitação conhecida; "destaque" curado não existe).
-   Listas de pessoas e estratégias filtradas por estilo não oferecem, ainda, filtro por pessoa/estratégia nas telas de estilos.

## Alternativas consideradas

-   **Abas** (Sobre | Pessoas | Referências…): esconderiam conteúdo e quebram o link direto para uma dimensão; rejeitadas por já terem sido abandonadas no ADR-013.
-   **Rotas aninhadas só de referências**: inicialmente rejeitadas (preferi apenas filtrar a biblioteca geral), mas adotadas a pedido do responsável: a biblioteca geral traz filtros e faixa de contexto que atrapalham quem só quer ver as imagens daquele conteúdo. Pessoas e estratégias de um estilo continuam como listas filtradas, porque são entidades e não imagens.
-   **Rolagem infinita na página do estilo**: mantém tudo junto, mas torna a página pesada e o rodapé inalcançável.

## Reconsiderar quando

Houver necessidade de curar destaques (ordem manual das imagens) ou quando "influências" precisar apontar para outros estilos.
