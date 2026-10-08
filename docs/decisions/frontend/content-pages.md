# Páginas de conteúdo

**Situação:** implementada, com a direção visual do [ADR-013](../adr/ADR-013-editorial-archive-direction.md). Cobre início, Explorar, listagens e detalhes de **estilos**, **pessoas** e **estratégias**. Formulários: [content-forms.md](content-forms.md). Referências: [references.md](references.md). Coleções: [groups-and-favorites.md](groups-and-favorites.md).

## Contexto

É o núcleo do produto: consultar o arquivo, descobrir e **navegar entre dimensões** de um conteúdo (`../../IDEIA.md`). Cada tipo de conteúdo tem composição própria; nenhuma tela é "cabeçalho + grade de cartões".

## Início (`app/(app)/page.tsx`)

Entrada do arquivo pessoal, não um painel:

-   Título "Uma coisa → várias dimensões." (a frase de marca) e uma frase de convite.
-   **Destaque:** o estilo mais recente, grande (imagem 4:3 em 7 colunas e texto em 5), com eyebrow, título de até `text-6xl` e "Abrir estilo →".
-   **Dimensões:** índice tipográfico (Estilos, Pessoas, Estratégias, Referências) com a contagem de cada uma, cada linha um link grande com seta.
-   **Adicionado recentemente:** 8 imagens (referências e capas) em mosaico com legenda.
-   **Favoritos:** até 3 itens da coleção Favoritos, ou uma frase convidativa se estiver vazia.
-   Sem estilos, aparece um convite para criar o primeiro.

## Explorar (`app/(app)/explorar/page.tsx`)

Descoberta de **todo** o acervo (diferente de Estilos, que lista só estilos): título, faixa de ferramentas (busca única + índice de tags) e quatro seções, cada uma na composição do seu tipo: **Estilos** (5, em ritmo), **Imagens** (8, mosaico), **Pessoas** (4, retratos) e **Estratégias** (4, lista tipográfica), com contagem total e "Ver todos →" levando a busca e a tag. A seção Imagens some quando há filtro de tag (imagens não têm tags). Sem criação nem paginação.

## Listagens (`ContentBrowser`)

`/estilos`, `/pessoas`, `/estrategias` usam o mesmo Server Component, parametrizado por tipo, mas **cada tipo tem sua grade**:

| Tipo | Composição |
| --- | --- |
| Estilos | **Ritmo** assimétrico em 12 colunas (7, 5, 4, 4, 4 repetidos; formatos 3:2, 4:5, quadrado; deslocamentos verticais) |
| Pessoas | Retratos 4:5 (2/3/4 colunas), com deslocamento alternado em telas largas |
| Estratégias | **Lista tipográfica** numerada: número, categoria, nome grande, resumo, tags, miniatura 4:3 e seta |

Cabeçalho (eyebrow "Dimensão · …", título, lede, botão de criar), faixa de ferramentas (busca com borda inferior, ordenação, "Buscar" e índice de tags como texto; o ativo é sublinhado), contagem ("5 registros") e paginação textual. Filtros e busca são **links/GET**, funcionam sem JavaScript e preservam a URL. A busca casa nome, resumo e também período e origem (estilos), atuação (pessoas) ou categoria (estratégias). Página inexistente volta para a última. Tiles de listagem usam `h2`; dentro de seções, `h3`.

Estados: vazio (frase em serifa + ação), vazio com filtro ("Nada encontrado com esses filtros."), carregando (esqueleto), erro e não encontrado (títulos grandes com ação).

## Tile (`ImageTile`)

Imagem sem moldura (ou **placa tipográfica**), legenda estilo museu (eyebrow com metadados, título serifado, resumo de 2 linhas, tags em texto "A · B · C") e coração de favorito que só aparece no hover/foco (ou sempre, se favoritado ou em telas sem hover).

## Detalhes: páginas de dimensões

`/estilos/[slug]`, `/pessoas/[slug]`, `/estrategias/[slug]` compartilham `DetailHeader` e uma sequência de seções (`DimensionSection`: rótulo à esquerda, conteúdo à direita). Não há abas: **todas as dimensões estão na página**, com um **índice fixo** no topo (`SectionNav`, links âncora com contagem; o item da seção visível recebe `aria-current="location"`).

-   **Cabeçalho:** trilha, eyebrow com filete espectral, título enorme, subtítulo/lede, fatos (período, origem ou atuação) em definição com filetes, tags em texto, ações (coração + menu "⋯" com Salvar em grupo, Editar e Excluir). Variações: estilo (imagem 4:3 à esquerda), pessoa (retrato 4:5 menor à esquerda, período como subtítulo), estratégia (imagem à direita).
-   **Estilo:** História (abertura em serifa grande + corpo), Características (lista numerada), Influências, Pessoas (retratos), Estratégias (lista), Referências (mosaico + botão "Adicionar referência" para o dono) e **Estilos relacionados** (até 3, por tags em comum, vindos da API).
-   **Pessoa:** Biografia, Estilos, Referências.
-   **Estratégia:** Descrição, "Aplica-se a" (estilos), Referências.
-   Seções sem conteúdo mostram uma frase curta em serifa. O conteúdo não precisa estar completo.
-   Excluir pede confirmação em modal (`ConfirmDialog`).

## Decisões

-   **Composição por tipo** em vez de uma grade única; ver ADR-013.
-   **Páginas contínuas com índice fixo** em vez de abas: coerente com "várias dimensões" e sem esconder conteúdo.
-   **Um `ContentBrowser`/`ContentGrid`/`ImageTile` para os três tipos**, com mapeadores em `lib/content.ts` e layouts selecionados por tipo; evita três cópias, ao custo de uma camada de apresentação.
-   Rotas por **slug**, estáveis (a API não altera o slug ao renomear).
-   Edição em páginas próprias (`/…/editar`), não inline (`FRONTEND.md` sugere edição "dentro da página"; edição inline não foi implementada).

## Limitações

-   Estilos relacionados só existem para estilos (por tags); pessoas e estratégias não têm "relacionados" próprios.
-   Seletores de vínculo (estilos nos formulários) carregam no máximo 100 itens.
-   Só duas ordenações (nome e mais recentes); sem filtros estruturados por período ou origem (a busca de texto cobre).
-   Sem retratos reais de demonstração, as pessoas aparecem como placas tipográficas.

## Arquivos

`app/(app)/{page,explorar,estilos,pessoas,estrategias}/**`, `components/content/*` (`ImageTile`, `ContentGrid`, `StrategyList`, `CoverImage`, `ContentBrowser`, `ContentFilters`, `ListSearch`, `DetailActions`, `Paragraphs`, `NumberedList`), `components/layout/{PageHeader,Section,DimensionSection,DetailHeader,SectionNav}.tsx`, `lib/content.ts`, `lib/data.ts`.
