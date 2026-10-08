# Páginas de conteúdo

**Situação:** implementada. Cobre início, listagens e detalhes de **estilos**, **pessoas** e **estratégias**. Formulários: [content-forms.md](content-forms.md). Referências: [references.md](references.md).

## Contexto

É o núcleo do produto: consultar a enciclopédia visual, descobrir conteúdos e navegar entre eles (`../../IDEIA.md`).

## Início (`app/(app)/page.tsx`)

-   Saudação com o primeiro nome do usuário.
-   **Destaque:** o estilo mais recente (`sort=recent`), em faixa larga com título sobre a imagem. Sem estilos, mostra estado vazio com botão "Novo estilo".
-   **Favoritos:** até 4 itens do grupo Favoritos (estilos, pessoas e estratégias juntos), com link "Ver grupo".
-   **Estilos recentes:** os 4 seguintes.
-   Referência: tela "02 inicio dashboard". Não há seções "pessoas recentemente adicionadas" nem "estratégias em alta" da referência.

## Listagens

## Explorar × Estilos

São páginas **diferentes**:

-   **`/explorar`** (`app/(app)/explorar/page.tsx`) é a tela de **descoberta**: busca única e filtro por tag valendo para tudo, e seções — Estilos, Pessoas, Estratégias e Imagens — com os 8 itens mais recentes de cada uma, contagem total e "Ver todos →" para a lista completa (a busca e a tag são levadas junto). A seção Imagens some quando há filtro de tag (imagens não têm tags). Não tem botões de criar nem paginação.
-   **`/estilos`** é a **lista de estilos**: só estilos, com busca, ordenação, filtro por tag, paginação e botão "Novo estilo".

Antes de 2026-10-08 as duas eram a mesma página com título diferente; foram separadas a pedido do responsável.

## Listagens

Páginas `/estilos`, `/pessoas`, `/estrategias` usam o mesmo Server Component `components/content/ContentBrowser.tsx`, parametrizado por tipo (`style`, `person`, `strategy`):

1.  Lê `searchParams` (`tag`, `q`) e chama a API (`lib/data.ts`).
2.  Converte cada item para o formato de card (`lib/content.ts`: `styleToCard`, `personToCard`, `strategyToCard`).
3.  Mostra filtros por tag (`ContentFilters`, links com `aria-current`), a grade (`ContentGrid`), a paginação e o botão de criar.

Pedir uma página além da última **redireciona para a última** (`redirectIfBeyondLastPage`, `lib/pagination.ts`).

A **paginação** (`components/ui/Pagination.tsx`, "Anterior / Página x de y / Próxima") também é feita por links com `?page=`, preservando `tag` e `q`; usa o `meta` devolvido pela API (24 por página).

Os filtros são **links** (URL com `?tag=`), então funcionam sem JavaScript e são compartilháveis. Cada listagem tem um **campo de busca próprio** (`components/content/ListSearch.tsx`, formulário `GET` que preserva a tag) e um seletor de **ordenação** (Nome / Mais recentes). A busca casa nome, resumo e também período e origem (estilos), atuação (pessoas) ou categoria (estratégias), e é como se "filtra por período/origem": digite `1919` ou `Alemanha`. Não há filtros estruturados de período/origem.

Estados: vazio sem filtro ("Ainda não há…" + botão de criar), vazio com filtro ("Nada encontrado com esses filtros"), carregamento (esqueleto de `loading.tsx`) e erro (`error.tsx`, com "Tentar novamente").

Referências visuais: "03 explorar estilos" (grade de cards com tags) e "05 pessoas designers" (retratos em proporção vertical: pessoas usam `aspect-[4/5]`, os demais `aspect-[4/3]`).

## Card (`ContentCard`)

Imagem (ou [fallback](design-system.md)), nome em serifa, metadados (período · origem; pessoas: atuação · período; estratégias: categoria), resumo limitado a 2 linhas, tags e o coração de favorito sobreposto (`FavoriteButton`, ver [grupos e favoritos](groups-and-favorites.md)).

## Detalhes

`/estilos/[slug]`, `/pessoas/[slug]`, `/estrategias/[slug]` têm a mesma estrutura:

-   Trilha de navegação, imagem principal (quadrada; retrato para pessoas), título, resumo, metadados, tags e `DetailActions` (`components/content/DetailActions.tsx`): o **coração** de favorito e um menu **"⋯"** (`components/ui/ActionMenu.tsx`) com **Salvar em grupo** (abre um modal com os grupos, `GroupModal`), **Editar** e **Excluir** (estes dois só para o dono). O menu fecha com `Esc` ou clique fora e navega com setas.
-   Abas (`components/ui/Tabs.tsx`, acessíveis com `role="tablist"`):
    -   **Estilo:** História, Características, Influências, Pessoas, Estratégias, Referências.
    -   **Pessoa:** Biografia, Estilos, Referências.
    -   **Estratégia:** Descrição, Estilos, Referências.
-   As abas de relacionados (Pessoas, Estratégias, Estilos) reutilizam `ContentGrid`, permitindo navegar entre conteúdos relacionados.
-   Seções sem conteúdo mostram `EmptySection`; o conteúdo não precisa estar completo (`../../IDEIA.md`).
-   Parágrafos de texto longo vêm separados por linha em branco (`Paragraphs`), sem Markdown.
-   Referência visual: "04 detalhe estilo bauhaus" (imagem à esquerda, abas sob o cabeçalho). Pessoas e estratégias seguem a mesma estrutura por consistência (não há mockup específico).

Excluir pede confirmação em um **modal** próprio (`ConfirmDialog`), não no diálogo do navegador; o mesmo vale para excluir tag, grupo e referência.

## Decisões

-   **Um único `ContentBrowser`/`ContentGrid`/`ContentCard` para os três tipos**, com mapeadores em `lib/content.ts`. Evita três cópias quase idênticas; o custo é a camada de mapeamento. Reconsiderar se os tipos divergirem muito visualmente.
-   Rotas por **slug**, legíveis e estáveis (a API não altera o slug ao renomear).
-   Detalhes são páginas de servidor; a edição acontece em páginas próprias (`/…/editar`), não "dentro da página", como `FRONTEND.md` sugere ("edição dentro das páginas"). Edição inline não foi implementada.

## Limitações

-   Seletores de vínculo (estilos nos formulários de pessoa/estratégia/referência) carregam no máximo 100 itens.
-   Sem filtros estruturados por período/origem (só pela busca de texto) e só duas ordenações.
-   Aba "Pessoas" de um estilo mostra pessoas vinculadas a ele; não há como vincular a partir da página do estilo (o vínculo é editado na pessoa/estratégia).

## Arquivos

`app/(app)/{page,estilos,explorar,pessoas,estrategias}/**`, `components/content/DiscoverySection.tsx`, `components/content/*`, `components/ui/{Tabs,EmptySection}.tsx`, `lib/content.ts`, `lib/data.ts`.
