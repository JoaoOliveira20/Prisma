# ADR-013: Direção visual "arquivo editorial"

-   **Data:** 2026-10-08
-   **Status:** aceita
-   **Substitui (visualmente):** o desenho inicial de catálogo (sidebar + cabeçalho com busca + filtros em pílulas + grade uniforme de cartões), descrito até então em `frontend/design-system.md` e `frontend/content-pages.md`.

## Contexto

O primeiro desenho funcionava, mas toda página era o mesmo molde: sidebar, cabeçalho, pílulas de filtro e uma grade de cartões iguais. Lia-se como um painel de catálogo, o oposto da proposta (`../../IDEIA.md`: enciclopédia visual pessoal, "uma coisa → várias dimensões"). Além disso, as dimensões de um conteúdo ficavam escondidas atrás de abas, as imagens eram pequenas, e pessoas sem foto viravam blocos escuros pesados. O responsável pediu um redesenho completo, com imagens como protagonistas, aparência de arquivo/publicação editorial e personalidade própria por página.

## Decisão

Adotar uma linguagem **editorial**, aplicada a todo o produto:

-   **Composição por tipo de conteúdo**, não uma grade única: estilos em grade assimétrica com ritmo (cinco posições que se repetem), pessoas em retratos com deslocamento alternado, estratégias como índice tipográfico numerado, referências em mosaico ("masonry") com legenda, coleções como mosaicos 2×2, tags como índice tipográfico.
-   **Detalhes como páginas contínuas de "dimensões"**: um conteúdo mostra todas as suas dimensões em sequência (história, características, influências, pessoas, estratégias, referências, relacionados), com um índice fixo no topo (sem abas), em vez de esconder dimensões atrás de abas.
-   **Hierarquia por tipografia**: títulos em serifa em escala grande (até `text-7xl`), rótulos pequenos em caixa alta com espaçamento ("eyebrow"), numeração em algarismos tabulares, e **filetes finos** no lugar de caixas e cartões.
-   **Cantos retos** (`rounded-sm`, 2 px) em controles e painéis; imagens sem raio; só botões circulares de ícone e avatares são redondos.
-   **Uma única intervenção cromática** na interface: um filete espectral de 2 px (`.spectrum-rule`) ao lado do rótulo de cada página e como marcador do item ativo da sidebar; o resto é grafite, papel e cinzas quentes. O acento vermelho fica no coração de favorito.
-   **Busca global na sidebar** (não repetida em cada cabeçalho); sidebar agrupada em *Arquivo*, *Dimensões*, *Coleções* e *Vocabulário*.
-   **Sidebar fixa só a partir de 1024 px**; abaixo disso, barra superior com busca e menu.

## Justificativa

A mudança ataca o problema que o responsável apontou (parecer um template) sem mudar o produto: mesmas funcionalidades, outra composição. Páginas contínuas combinam com o conceito de "dimensões". Menos caixas e cores deixam as imagens (o conteúdo) em primeiro plano. A tipografia serifada já fazia parte da identidade e carrega a hierarquia sem precisar de peso, cor ou moldura.

## Consequências

-   Os componentes de cartão e abas foram **substituídos** (`ContentCard` → `ImageTile`; `Tabs` removido); telas e testes que dependiam deles foram reescritos.
-   Mais CSS específico de composição (grades por posição, colunas sticky); cuidado para não voltar a uma grade única "por simplicidade".
-   Dependemos de imagens para a página ficar bonita; sem imagem, o conteúdo mostra uma placa tipográfica (a inicial em serifa sobre papel), que é intencional.
-   Textos longos sem espaços podiam estourar o layout; por isso `overflow-wrap: anywhere` no `main`.
-   O guia visual externo (`GUIA-DE-DESIGN.md`, fora do repositório, de antes desta mudança) está **desatualizado**.

## Alternativas consideradas

-   **Refinar o desenho existente** (ajustar cores, raios e espaçamento): descartada porque o problema era de composição, não de acabamento.
-   **Abas nos detalhes**: descartadas por contrariar o conceito de dimensões e esconder conteúdo; o índice fixo mantém a navegação rápida.
-   **Mosaico único para tudo** (estilo Pinterest): descartado; apaga a diferença entre tipos de conteúdo e a leitura de texto.

## Quando reconsiderar

Se a leitura de conteúdo com muitas imagens (ou muito texto) mostrar problemas de desempenho ou de ritmo; ou se for decidido oferecer um tema escuro completo (hoje há um tema claro com sidebar escura).

## Referências

-   [Design system](../frontend/design-system.md), [Páginas de conteúdo](../frontend/content-pages.md), [Navegação](../frontend/navigation.md)
-   `frontend/app/globals.css`, `frontend/components/layout/`, `frontend/components/content/`
