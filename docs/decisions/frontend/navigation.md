# Navegação e sidebar

**Situação:** implementada. Regras de produto: `CLAUDE.md` (navegação principal por sidebar; pesquisa com Ctrl/Cmd+K). Direção: [ADR-013](../adr/ADR-013-editorial-archive-direction.md).

## Sidebar ([ADR-017](../adr/ADR-017-sidebar-as-archive-index.md))

Arquivos: `components/layout/{Sidebar,SidebarItem,SidebarAccount,NavIcon}.tsx`, `components/search/SearchTrigger.tsx`, `lib/navigation.ts`. `app/(app)/layout.tsx` busca o usuário e lê o cookie `prisma_sidebar` para o estado inicial.

**Mapa em três blocos** (`navigationGroups`; a lista plana alimenta os comandos da paleta):

-   *Entrada*, sem rótulo: **Início** e **Explorar**.
-   **Dimensões:** Estilos, Pessoas, Estratégias, Referências e **Tags** (o vocabulário que atravessa as quatro; o grupo "Vocabulário" de um item só foi extinto).
-   **Minha coleção:** Favoritos e Grupos (organização pessoal).

**Item ativo (onde estou):** o rótulo vira **serifa maior** (a mesma voz do conteúdo), o texto fica no tom pleno e um **filete espectral** de 2 px cresce na **borda** da sidebar, como uma orelha de fichário (`aria-current="page"`). Em páginas de detalhe, o item da dimensão fica no mesmo estado com `aria-current="true"` ("você está dentro desta seção"); a trilha do conteúdo completa o caminho. Sem caixas coloridas, brilho ou barra grossa. **Hover:** texto mais claro, fundo discreto (`sidebar-raised`) e o filete aparece a 40%. Transições de 200 a 300 ms só em cor, opacidade e transform.

**Minimizar** (botão com chevron que gira): a largura anima, rótulos e nomes de grupo somem por opacidade e os grupos passam a ser separados por filetes. A escolha **persiste em cookie** (sem piscar ao recarregar). No modo minimizado cada ícone tem **dica** (um único elemento fixo posicionado por JavaScript, `aria-hidden`; aparece no hover ou no foco de teclado, não é cortado pela rolagem da barra). O rótulo continua acessível a leitores de tela.

**Logo:** link para o Início (`aria-label="PRISMA, início"`); minimizada, só o símbolo.

**Busca:** "Buscar" com o atalho (**⌘ K** em Mac/iOS, **Ctrl K** nos demais; `aria-keyshortcuts`), abre a [pesquisa global](global-search.md).

**Conta** (grupo `aria-label="Conta"`): avatar com a inicial, nome em serifa e **Sair** (linha como as demais). Não há Perfil nem Configurações porque essas telas não existem; quando existirem, pertencem a esta área, não à navegação principal.

**Mobile (< 1024 px):** barra superior (logo, busca, menu com ícone que vira "X", alvo de 44 px) e um painel de índice com rótulos em serifa de 20 px e linhas de 48 px. Ao abrir: o foco vai ao primeiro item, o conteúdo fica `inert`, a rolagem da página é bloqueada; `Esc` fecha e devolve o foco ao botão; navegar fecha. O painel entra por opacidade e deslocamento de 8 px.

Largura 256 px (72 px minimizada), fundo `sidebar`, borda direita `sidebar-border`; `night-scope` dá foco claro.

## Breakpoint

A sidebar fixa só aparece a partir de **1024 px (`lg`)**. Abaixo disso há uma **barra superior** escura (logotipo, botão de busca e botão de menu) e o menu abre como painel sobre o conteúdo, fechando com `Esc` ou ao navegar. Em 820 px, por exemplo, o conteúdo ocupa a largura toda. (Antes de 2026-10-08 a sidebar fixa aparecia já em 768 px e comia um terço do tablet.)

## Outros elementos de navegação

-   **Link "Pular para o conteúdo"** (visível só com foco de teclado) antes da sidebar; o `main` tem `id="conteudo"`.
-   **Trilha** nos detalhes (`DetailHeader`) e **índice de dimensões** fixo (`SectionNav`, `aria-label="Dimensões deste conteúdo"`), com indicador que desliza até a seção ativa e rolagem suave (respeita `prefers-reduced-motion`).
-   **Favoritos** é item de menu e leva a `/favoritos`, a coleção Favoritos (ver [groups-and-favorites.md](groups-and-favorites.md)).
-   **Explorar × Estilos:** Explorar é a descoberta de todos os tipos; Estilos é a lista de estilos ([content-pages.md](content-pages.md)).

## Limitações

-   Minimizar muda a largura do `main` durante a animação (o mosaico de imagens reflui por ~300 ms). É aceitável, mas pesado com muitas imagens.
-   O painel mobile não é um modal verdadeiro: o foco é movido e o conteúdo fica inerte, mas `Tab` ainda alcança a barra superior (de propósito, para o botão de fechar).
-   Sem Perfil/Configurações (não existem no produto); sem submenus nem listas de grupos na sidebar.
-   Dicas só no modo minimizado; a dica de teclado depende de `:focus-visible`.
