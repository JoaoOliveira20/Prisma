# Pesquisa global (Command Palette)

**Situação:** implementada. Busca em estilos, pessoas, estratégias, referências, grupos e tags, mais **comandos** de navegação e de criação.

## Origem do desenho

O visual e o comportamento foram adaptados de um exemplo de paleta de comandos da documentação da biblioteca Motion (`motion.dev/examples/react-command-palette`). **A biblioteca não é usada**: o projeto não tem dependência de animação, então os efeitos foram refeitos com CSS e React. O exemplo pago não expõe estilos; a aparência segue os tokens do nosso design system.

O que foi trazido do exemplo: gatilho com atalho, caixa de busca com ícone e botão de limpar, resultados agrupados com rótulo, ícone/miniatura por item, destaque da seleção que **desliza** entre os itens, rolagem automática até o item selecionado, navegação por setas **em ciclo**, rodapé com dicas de teclado e animação de entrada e saída.

## Funcionamento

-   Aberta por **Ctrl+K / Cmd+K** em qualquer tela autenticada, pelo botão **Buscar** no topo da sidebar ou, abaixo de 1024 px, pelo ícone de busca da barra superior (`components/search/SearchTrigger.tsx`, que dispara o evento `prisma:open-search`).
-   `components/search/CommandPalette.tsx` (montado em `app/(app)/layout.tsx`) usa `<dialog>` modal nativo (foco preso). `components/search/CommandResults.tsx` desenha a lista.
-   **Sem texto digitado:** mostra os **comandos**, em dois grupos: **Ir para** (um por item da sidebar, vindo de `lib/navigation.ts`) e **Criar** (Novo estilo, Nova pessoa, Nova estratégia, Nova referência). Definidos em `lib/commands.ts` (opções estáticas deliberadas; não são dados de negócio).
-   **Com texto:** os comandos são filtrados **na hora**, ignorando maiúsculas e acentos (`estrategia` encontra "Estratégias"), e a API é consultada com **debounce de 200 ms** e cancelamento da requisição anterior (`GET /api/search?q=`, Route Handler `app/api/search/route.ts`). Resultados da API vêm depois dos comandos, agrupados por tipo.
-   O Route Handler consulta `/styles`, `/people`, `/strategies`, `/references`, `/groups` e `/tags` em paralelo e devolve até **5 itens por tipo**, com `href`, nome, subtítulo e imagem. Destinos: estilos/pessoas/estratégias → página de detalhe; **referências** → `/referencias?q=<título>`; **grupos** → `/grupos/<id>`; **tags** → `/explorar?tag=<slug>`. O comando **Nova referência** leva a `/referencias?nova=1`, que abre o modal de criação ao carregar.
-   **Teclado:** `↑`/`↓` movem a seleção e dão a volta nas pontas; `Enter` abre o item selecionado; `Esc` fecha; a seleção volta ao primeiro item a cada texto novo. **Mouse:** passar o mouse seleciona, clicar abre; clicar fora fecha.
-   **Item selecionado:** destaque deslizante (uma camada única, `data-palette-highlight`, movida por `transform` com transição de 180 ms, posicionada medindo o item), um **filete espectral vertical** na borda esquerda do destaque (a mesma linguagem do item ativo da sidebar) e, no fim da linha, "Abrir ↵" (o destino da ação; não depende só de cor).
-   **Composição (2026-10-09):** painel de **46 rem** (antes 40), a 10% da altura da janela (no celular, 12 px do topo e 12 px de margem lateral); lista de até **30 rem** (limitada por `100dvh − 10rem`), com `overscroll-contain`. O campo ganhou presença (serifa `text-xl`, ícone maior, `py-5`) e, ao receber foco, um **filete espectral** de 2 px se desenha sob ele (`.spectrum-gradient`); durante a busca esse mesmo filete corre (`.palette-loading`). Cabeçalhos de grupo mostram a **contagem**; linhas de resultado têm miniatura de 40 px e nome em 15 px com subtítulo secundário; as linhas de **comando** são compactas (ícone de 32 px). Com texto, o rodapé informa "N resultados". Sem texto, o campo mostra a dica `esc`; com texto, o botão "×" limpa. No **celular** aparece um botão "Fechar" no cabeçalho e o rodapé de dicas some.
-   **Animações** (CSS em `app/globals.css`, classe `command-palette`): entrada de 160 ms (opacidade + leve subida e zoom) e saída de 120 ms; o fundo escurece com transição própria. Para a saída, o fechamento nativo é adiado até o fim da animação (`data-closing`, com um fallback de 250 ms). Reabrir durante a saída cancela o fechamento. `prefers-reduced-motion` reduz tudo a ~0 ms (regra global).
-   **Estados:** carregando (filete animado sob o campo e "Buscando…" anunciado a leitores de tela), erro ("Não foi possível pesquisar agora." com **Tentar novamente**), sem resultados (título "Nenhum resultado para “…”", uma frase de orientação e **Limpar busca**; o rodapé só mostra "fechar") e a lista de comandos quando vazio.
-   **Acessibilidade:** `combobox` com `aria-controls`, `aria-activedescendant` e `aria-autocomplete`; lista `listbox` com grupos (`role="group"` e rótulo) e opções `aria-selected`; botão "Limpar busca" rotulado; o foco volta ao campo ao limpar. O anel de foco global é desativado só no campo da paleta (ele ficava cortado pela borda do diálogo); o foco é indicado pelo filete espectral sob o campo, pelo cursor e pelo destaque do item. Ao fechar, o foco volta ao elemento que abriu (o `<dialog>` nativo restaura), e o fundo fica inerte enquanto a paleta está aberta.

## Decisões

-   **Route Handler em vez de chamada direta:** o token fica no cookie `httpOnly` e só o servidor do Next pode usá-lo ([ADR-003](../adr/ADR-003-frontend-backend-integration.md)).
-   **Sem biblioteca de animação:** CSS e medição de posição bastam para o destaque deslizante e para a entrada/saída; evita uma dependência (`CLAUDE.md`).
-   **Lista só montada com o diálogo aberto:** o destaque depende de medir os itens, e um diálogo fechado tem altura zero. Foi um defeito real (primeira abertura sem destaque).
-   **Comandos junto com resultados** na mesma lista navegável por teclado, em vez de modos separados.
-   A busca é o `LIKE` da API; não há busca textual avançada nem tolerância a erros de digitação (só os comandos ignoram acentos).

## Limitações

-   Seis chamadas à API por pesquisa (em paralelo).
-   Tags levam só à listagem de estilos; referências abrem a biblioteca filtrada, não o item.
-   Não há atalhos de teclado por comando (o exemplo original mostra atalhos; aqui só `↵`).
-   O gatilho da sidebar mostra ⌘ K no Mac/iOS e Ctrl K nos demais.
-   A animação de reflow ao filtrar (itens deslizando) do exemplo original não foi reproduzida; a lista troca de conteúdo sem transição, só o destaque desliza.

## Testes

`e2e/tags-search.spec.ts` (ver [testing.md](testing.md)): grupos por tipo, comandos sem busca, filtro por texto e acentos, ciclo das setas, `aria-activedescendant`, Enter, limpar, Esc, clique fora, reabertura, comando que abre o modal, posição do destaque, **largura do painel, "Abrir" só no item selecionado e retorno do foco ao botão da sidebar**, estado sem resultado (com "Limpar busca") e **erro com "Tentar novamente"** (rota `/api/search` simulada). `e2e/responsive.spec.ts`: no celular o painel cabe na tela, o botão "Fechar" funciona e os itens têm ao menos 44 px.

## Referência visual

Tela "09 busca global" do mockup (campo no topo, resultados por categoria) e o exemplo de paleta da Motion. Apresentada aqui como diálogo flutuante, não como tela cheia.
