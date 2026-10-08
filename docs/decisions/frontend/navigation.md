# Navegação e sidebar

**Situação:** implementada. Regras de produto: `CLAUDE.md` (navegação principal por sidebar; pesquisa com Ctrl/Cmd+K). Direção: [ADR-013](../adr/ADR-013-editorial-archive-direction.md).

## Sidebar (`components/layout/Sidebar.tsx`)

Componente de cliente montado por `app/(app)/layout.tsx` (que busca o usuário com `getCurrentUser`).

-   **Estrutura em índice**, em quatro grupos com rótulo em caixa alta: **Arquivo** (Início, Explorar), **Dimensões** (Estilos, Pessoas, Estratégias, Referências), **Coleções** (Favoritos, Grupos) e **Vocabulário** (Tags). Definida em `lib/navigation.ts` (`navigationGroups`); a lista plana alimenta os comandos da paleta.
-   **Busca no topo** (`SidebarSearchTrigger`): "Buscar · Ctrl K", abre a [pesquisa global](global-search.md). A busca **não** é repetida em cada página.
-   **Item ativo:** texto claro e um **filete espectral** vertical à esquerda (`aria-current="page"`); início só no caminho exato, os demais por prefixo. Inativos em `sidebar-muted`, com realce no hover. Sem fundos preenchidos.
-   **Minimizar** (botões `«` / `»`): só ícones, rótulos para leitores de tela, `title` com o nome. O estado **não persiste** (volta expandida ao recarregar).
-   **Rodapé:** nome do usuário em serifa e "Sair".
-   Largura 256 px (68 px minimizada), fundo `sidebar`, borda direita `sidebar-border`; `night-scope` dá foco claro.

## Breakpoint

A sidebar fixa só aparece a partir de **1024 px (`lg`)**. Abaixo disso há uma **barra superior** escura (logotipo, botão de busca e botão de menu) e o menu abre como painel sobre o conteúdo, fechando com `Esc` ou ao navegar. Em 820 px, por exemplo, o conteúdo ocupa a largura toda. (Antes de 2026-10-08 a sidebar fixa aparecia já em 768 px e comia um terço do tablet.)

## Outros elementos de navegação

-   **Link "Pular para o conteúdo"** (visível só com foco de teclado) antes da sidebar; o `main` tem `id="conteudo"`.
-   **Trilha** nos detalhes (`DetailHeader`) e **índice de dimensões** fixo (`SectionNav`, `aria-label="Dimensões deste conteúdo"`).
-   **Favoritos** é item de menu e leva a `/favoritos`, a coleção Favoritos (ver [groups-and-favorites.md](groups-and-favorites.md)).
-   **Explorar × Estilos:** Explorar é a descoberta de todos os tipos; Estilos é a lista de estilos ([content-pages.md](content-pages.md)).

## Limitações

-   Estado minimizado não persiste.
-   O painel do menu mobile fecha com `Esc`, mas não prende o foco.
-   Não há indicação de "onde estou" para páginas de detalhe além da trilha (o item da sidebar da dimensão fica ativo por prefixo).
