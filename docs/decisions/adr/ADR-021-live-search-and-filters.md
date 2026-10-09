# ADR-021: Busca e filtros das páginas de conteúdo reativos, com a URL como estado

-   **Data:** 2026-10-09
-   **Status:** aceita
-   **Altera:** a decisão de filtros e busca como links/formulários GET sem JavaScript (descrita em `frontend/content-pages.md`). **Não afeta** a pesquisa global da sidebar ([global-search.md](../frontend/global-search.md)), que é outro componente.

## Contexto

Nas listas de estilos, pessoas, estratégias, no Explorar e nas referências de um conteúdo, a busca só rodava no `submit` (Enter ou botão "Buscar"). No celular, os botões "Buscar" e "Limpar" tinham o mesmo aspecto das tags de filtro, e "Limpar" misturava limpar o texto e limpar filtros.

## Decisão

1.  **A URL continua sendo o estado** (`q`, `tag`, `sort`, `style`, `page`), então tudo segue compartilhável, funciona com o botão voltar e continua renderizado no servidor. O que muda é quem atualiza a URL: o hook `useUrlFilters` (cliente) grava `q` com **debounce de 250 ms** e aplica os demais filtros na hora, com `router.replace` dentro de `startTransition` (sem recarregar a página e sem rolar). Enter aplica imediatamente e `Esc` limpa o texto.
2.  **Sem requisições manuais:** a navegação do Next cuida de substituir respostas antigas pela mais recente, então não há resposta "fora de ordem". Quem digita não perde caracteres: o campo guarda o texto localmente e só se ressincroniza com a URL quando ela muda por outro motivo (voltar/avançar, "Limpar tudo").
3.  **Sem botão "Buscar"**: a busca é automática. O texto tem um "×" dentro do campo ("Limpar busca"), que apaga **só o texto**.
4.  **"Limpar tudo"** é uma ação separada, em texto sublinhado (não em caixa), que remove busca e tags (preserva a ordenação e o contexto de estilo, que tem a própria faixa "Remover filtro"). Aparece só quando há critério.
5.  **Hierarquia visual:** campo de busca em caixa de papel claro com ícone (`SearchField`); **tags** como botões retangulares pequenos com `aria-pressed` e um "×" no selecionado (`TagFilter`: não depende só de cor); **ações** como texto sublinhado; **seleção** (ordem) como controle em caixa. No celular as tags rolam na horizontal (com a tag ativa trazida para a vista) e os alvos têm ao menos 40 px.
6.  Os resultados ficam a 50% de opacidade enquanto a navegação carrega (`aria-busy`), e a contagem é anunciada (`aria-live`). Sem resultado, a mensagem oferece "Limpar busca e filtros".
7.  O mesmo hook e o mesmo campo servem à biblioteca de referências (`LibraryShell`), removendo a lógica duplicada.

## Justificativa

Manter a URL como fonte da verdade evita um segundo estado no cliente e preserva o que já funcionava (links, voltar, renderização no servidor). O debounce curto protege o servidor sem parecer lento.

## Consequências

-   A busca e os filtros dessas páginas agora **dependem de JavaScript** (antes funcionavam como formulário simples). A navegação e a renderização das páginas continuam no servidor.
-   Cada pausa de digitação gera uma renderização no servidor (com 250 ms de debounce, no máximo ~4 por segundo).
-   Erros de rede na renderização caem na tela de erro do app, com tentativa de novo; não há estado de erro próprio na busca.
-   A pesquisa global da sidebar não usa esses componentes e permanece como estava.

## Alternativas consideradas

-   **Filtrar no cliente:** não serve, porque as listas são paginadas e a busca roda no servidor.
-   **Manter o botão "Buscar" só como alternativa:** redundante com a busca automática e com o Enter.
-   **Painel de filtros (como na biblioteca) nas listas:** há só uma tag e a ordem; seria cerimônia demais. Reavaliar se houver mais filtros.

## Reconsiderar quando

Surgirem mais filtros nessas páginas (painel, como na biblioteca) ou se o custo das renderizações a cada digitação incomodar (aumentar o debounce).
