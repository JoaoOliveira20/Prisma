# Coleções: grupos e favoritos (frontend)

**Situação:** implementada. Decisão: [ADR-004](../adr/ADR-004-favorites-as-groups.md). Backend: [backend/groups-and-favorites.md](../backend/groups-and-favorites.md). Direção visual: [ADR-013](../adr/ADR-013-editorial-archive-direction.md).

## Conceito na interface

Favoritos **são uma coleção**: o grupo padrão "Favoritos" de cada usuário. Na interface as coleções aparecem como **mosaicos de imagens** (algo guardado e curado), não como linhas de uma tabela.

## Telas e componentes

-   **`/grupos`** (`app/(app)/grupos/page.tsx`): cada coleção é um mosaico quadrado 2×2 com até 4 imagens dos itens (`CollectionCover`; com 1 imagem ocupa o quadrado; sem imagens, a inicial do nome em serifa) e, abaixo, o nome em serifa grande e a contagem. Favoritos vem primeiro, marcada como "Coleção padrão", e aponta para `/favoritos`. As prévias vêm da API (`previews`). O botão **Nova coleção** (`CreateGroupButton`) abre um modal com o nome.
-   **`/favoritos`** (`app/(app)/favoritos/page.tsx`): a coleção Favoritos como página própria. É também o item "Favoritos" da sidebar. `/grupos/[id]` redireciona o grupo Favoritos para cá.
-   **`/grupos/[id]`**: uma coleção personalizada: eyebrow com a contagem, título grande, link "← Todas as coleções" e, para o dono, um menu "⋯" (`GroupActions`) com **Renomear** (modal) e **Excluir** (confirmação em modal).
-   **Conteúdo da coleção** (`CollectionView`, usado nas duas telas): seções por tipo, cada uma **na composição do seu tipo**: Estilos (ritmo), Referências (mosaico, com lightbox), Pessoas (retratos) e Estratégias (lista tipográfica). Coleção vazia mostra uma frase em serifa e o botão "Explorar o arquivo".
-   **Coração** (`FavoriteButton`): nos tiles (aparece no hover/foco), nos detalhes e no lightbox. Atualização **otimista** (`useOptimistic`) e depois a Server Action `setFavorite` → `POST/DELETE /favorites/{type}/{slug}`.
-   **"Salvar em grupo"**: item do menu "⋯" dos detalhes e do lightbox; abre o modal `GroupModal` com uma caixa por coleção (otimista). Os grupos vêm de `getGroups()` e os marcados de `group_ids`.
-   **Início:** a seção "Favoritos" mostra até 3 itens.

## Decisões

-   Mosaicos de prévia em vez de listas: dão a sensação de coleção sem exigir capa escolhida; o custo é uma consulta extra por grupo na API.
-   Renomear e excluir saíram da página para um menu e modais, deixando a coleção limpa.
-   Atualização otimista no coração e no menu: resposta imediata; em falha, a interface volta ao estado do servidor na revalidação seguinte.
-   Server Actions invalidam o layout (`revalidatePath("/", "layout")`) para manter o coração coerente em todas as telas.

## Limitações

-   Sem ordenação manual nem mover itens entre coleções; o mosaico mostra os itens mais recentes, não uma capa escolhida.
-   Referências usam o id como identificador nas ações (`type="reference"`, `slug=String(id)`), diferente dos demais tipos.
-   Sem tratamento visual de falha da ação otimista além do retorno ao estado do servidor.
-   Coleções só aceitam estilos, pessoas, estratégias e referências, não tags.
