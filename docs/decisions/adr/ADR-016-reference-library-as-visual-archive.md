# ADR-016: Biblioteca de referências como arquivo visual

-   **Data:** 2026-10-08
-   **Status:** aceita
-   **Complementa:** [ADR-012](ADR-012-unified-image-library.md) (consulta unificada) e [ADR-013](ADR-013-editorial-archive-direction.md) (direção editorial).

## Contexto

A biblioteca era um mosaico de cartões (imagem + título + descrição + tags repetidos), com filtros em formato de formulário (era preciso apertar "Filtrar"), sem ordenação, sem filtro por coleção, sem busca por tags ou conteúdos vinculados, sem página própria por referência e com pouca hierarquia. Parecia uma lista, não um repertório.

## Decisão

1.  **Imagem primeiro:** o cartão some; a imagem ocupa o lugar principal, com legenda de uma linha e o restante (tags, ações) revelado no hover/foco. A **última adição** abre a página como destaque.
2.  **Pesquisa por URL e ao vivo:** busca com debounce e filtros que se aplicam ao mudar, tudo em query string (compartilhável, funciona com voltar do navegador). Filtros: estilo, pessoa, estratégia, tag, coleção (inclui Favoritos), "só o que eu criei"; ordem mais recentes/mais antigas; chips de filtros ativos. A busca passa a cobrir tags e nomes dos conteúdos vinculados e a fonte.
3.  **Contexto explícito:** ao chegar de um estilo/pessoa/estratégia, a página diz "Filtrando por …" com o nome em destaque.
4.  **Página própria da referência** (`/referencias/[id]`), com "Faz parte de" e "Mais como esta", materializando "uma coisa → várias dimensões". O lightbox continua como visualização rápida.
5.  **Ações no próprio tile** (favoritar e salvar em grupo), sem abrir nada.

## Justificativa

-   Cartões repetidos escondem a imagem e criam ruído; tags e descrição pertencem à leitura de uma imagem específica (lightbox/página), não à varredura.
-   Quem procura algo específico precisa de busca rápida e filtros combináveis; quem explora precisa de pontos de entrada (destaque, tags clicáveis, relações).
-   Uma URL por referência permite compartilhar, voltar e navegar pelas relações.
-   Sem rota nova de API para a busca/filtros: `GET /images` ganhou `group`, `sort` e uma busca mais ampla.

## Consequências

-   Dois níveis de visualização (lightbox e página): o lightbox é para decidir rápido, a página para estudar.
-   Os seletores de filtro carregam até 100 estilos/pessoas/estratégias; a página faz 7 chamadas à API por renderização (cache de dados pode ser introduzido depois).
-   Imagens ainda no tamanho original; miniaturas e virtualização ficam para quando o volume pedir.
-   "Mais como esta" usa vínculos e tags em comum, sem recomendação algorítmica.

## Alternativas consideradas

-   **Rolagem infinita:** mais fluida, mas esconde o rodapé, dificulta voltar a um ponto e pede virtualização; mantida a paginação.
-   **Filtros em barra lateral permanente:** tira largura das imagens; preferi um painel que expande.
-   **Só o lightbox, sem página:** simples, mas sem URL, sem relações e sem espaço para descobrir.

## Reconsiderar quando

O acervo passar de algumas centenas de imagens por usuário (miniaturas, busca nos filtros) ou quando houver curadoria de destaques.
