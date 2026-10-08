# Navegação e sidebar

**Situação:** implementada. Regras de produto: `CLAUDE.md` (navegação principal por sidebar; pesquisa com Ctrl/Cmd+K).

## Sidebar (`components/layout/Sidebar.tsx`)

-   Componente de cliente, montado por `app/(app)/layout.tsx`, que busca o usuário (`getCurrentUser`) e o passa por prop.
-   **Desktop (≥ md):** coluna fixa e "sticky" de altura total, fundo escuro (`--color-sidebar`). Pode ser **minimizada** (só ícones, com texto acessível via `sr-only`) por botões `«` / `»`. O estado **não é persistido**: volta a expandida ao recarregar.
-   **Mobile:** vira barra superior com botão de menu; o menu abre como painel sobre o conteúdo e fecha ao navegar.
-   Rodapé com inicial do usuário, nome e botão **Sair**.
-   Item ativo recebe `aria-current="page"` (início só no caminho exato; os demais por prefixo).

## Itens (`lib/navigation.ts`)

Início `/`, Explorar `/explorar`, Estilos `/estilos`, Pessoas `/pessoas`, Estratégias `/estrategias`, Referências `/referencias`, Tags `/tags`, Grupos `/grupos`. Para adicionar uma seção: incluir o item aqui e um ícone em `components/layout/NavIcon.tsx`. Itens com `href: null` aparecem desabilitados ("Em breve"); hoje não há nenhum.

"Explorar" é a tela de descoberta de **todos** os tipos de conteúdo e "Estilos" é a lista de estilos (ver [content-pages.md](content-pages.md)).

"Favoritos" não é item de menu: favoritos são o grupo padrão dentro de Grupos (ver [grupos e favoritos](groups-and-favorites.md)).

## Cabeçalho de página (`components/layout/PageHeader.tsx`)

Título serifado, subtítulo, campo de pesquisa (abre a [pesquisa global](global-search.md)) e ações da página.

## Referência visual

Telas 02 a 09 de `docs/assets/screens/PRISMA_telas_preview.png` (sidebar escura à esquerda, conteúdo claro à direita) e tela 12 (mobile). A fidelidade foi avaliada pelo responsável do projeto, sem comparação automatizada.

## Limitações

-   Estado minimizado não persiste.
-   A sidebar mobile fecha com `Esc` e ao navegar, mas não prende o foco dentro do painel.
