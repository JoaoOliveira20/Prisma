# ADR-017: Sidebar como índice do arquivo

-   **Data:** 2026-10-08
-   **Status:** aceita
-   **Complementa:** [ADR-013](ADR-013-editorial-archive-direction.md).

## Contexto

A sidebar tinha quatro grupos (um deles com um único item), o estado ativo era uma barrinha solta a 12 px da borda, o minimizar não persistia e usava glifos de texto, não havia dicas nos ícones, o painel mobile não tratava foco nem rolagem, o ícone de Estratégias (livro) era ambíguo e a área de conta era só nome e "Sair".

## Decisão

1.  **Três blocos:** entrada (Início, Explorar), Dimensões (Estilos, Pessoas, Estratégias, Referências, Tags) e Minha coleção (Favoritos, Grupos). Tags entra em Dimensões porque classifica as quatro e aparece como filtro em todas; Favoritos e Grupos formam a organização pessoal.
2.  **Estado ativo editorial:** rótulo em serifa maior + filete espectral na borda da sidebar; seção de origem marcada em páginas internas (`aria-current="true"`).
3.  **Minimizar com persistência (cookie) e dicas** para os ícones, em vez de remover o recurso: o produto é de imagens e uma barra estreita devolve largura ao mosaico.
4.  **Conta** com avatar, nome e Sair. Perfil e Configurações **não** foram criados (não existem no produto).
5.  **Mobile como índice em tela cheia** (serifa, alvos de 44–48 px) com foco, `inert` no conteúdo, bloqueio de rolagem e devolução do foco.
6.  **Ícones:** Estratégias passa a usar o desenho de um caminho (decisão com bifurcação), já que livro sugeria leitura e a bússola é de Explorar; traço de 1,5 px a 18 px.
7.  **Sem animação de entrada** da sidebar no carregamento: é elemento permanente e animá-lo a cada recarga cansa; o movimento fica nas interações.

## Justificativa

Reduzir blocos e rótulos deixa o mapa legível ("entrada → dimensões → meu acervo"); usar a serifa no item ativo liga a navegação à voz editorial sem caixas; o cookie evita o "pisca" que um `localStorage` causaria no servidor.

## Consequências

-   A largura do `main` muda durante a animação de minimizar.
-   O cookie `prisma_sidebar` guarda só `collapsed`/`expanded` (sem dado pessoal).
-   Rótulos de grupo passam de 4 para 2 (o bloco de entrada não tem rótulo).

## Alternativas consideradas

-   **Barra inferior no mobile:** boa para o polegar, mas cria um segundo sistema de navegação e tira altura do conteúdo visual.
-   **Remover o minimizar:** mais simples, porém perde largura útil nas telas de imagem.
-   **Submenus com os grupos do usuário:** escalam mal (dezenas de grupos) e disputam atenção com as dimensões.
-   **Caixa preenchida no item ativo:** é o padrão genérico de painéis; rejeitada pelo critério de identidade.

## Reconsiderar quando

Existirem Perfil/Configurações (menu na área de conta) ou quando o mosaico sofrer com o reflow na animação (aí, sobrepor a barra em vez de empurrar o conteúdo).
