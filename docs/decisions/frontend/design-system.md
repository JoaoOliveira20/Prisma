# Design system e identidade visual

**Situação:** implementada de forma enxuta (tokens + componentes próprios). Princípios gerais: `../../DESIGN-SYSTEM.md`.

## Identidade

"PRISMA — Uma coisa → várias dimensões." Uma interface sóbria e editorial, que deixa as imagens em primeiro plano: **sidebar escura** de navegação, **área de conteúdo clara e quente** (papel off-white), títulos em **serifa** e rótulos em sans. Acentos de cor vêm principalmente das próprias imagens; o prisma (luz decomposta) aparece nas telas escuras e no logotipo.

## Referências visuais (somente desenvolvimento)

Ficam em `docs/assets/` e **não** são carregadas pelo app:

-   `docs/assets/screens/PRISMA_telas_preview.png`: 12 telas de referência (apresentação, início, explorar, detalhe, pessoas, referências, favoritos, grupos, busca, login, edição, mobile). Orientaram composição, layout e hierarquia. Foi usada como **guia**, não como especificação pixel a pixel.
-   `docs/assets/backgrounds/Prismas de Luz na Escuridão.png`: fundo escuro com feixes espectrais.
-   `docs/assets/backgrounds/Prisma de Vidro e Arco-Íris Luminoso.png`: prisma de vidro com arco-íris.

Cópias **usadas pelo app**, em `frontend/public/images/backgrounds/` (arquivos originais, sem recompressão):

-   **Arte de demonstração:** os estilos, estratégias e referências do seed usam SVGs originais criados para o projeto (`backend/database/seeders/images/`), com composições inspiradas em cada linguagem (formas primárias para Bauhaus, grade em perspectiva para Vaporwave etc.). São exemplos, não referências visuais da pasta `docs/assets/`.
-   `prism-light-dark.png`: **fallback de capa** (cards, detalhes, resultados de busca) quando um conteúdo não tem imagem. A inicial do nome é desenhada por cima.
-   `prism-beam.png`: fundo da coluna esquerda do login (com degradê escuro por cima).

## Tokens (`frontend/app/globals.css`)

Definidos em `@theme` (Tailwind 4), gerando utilitários (`bg-surface`, `text-text-muted`…). Nomes seguem `../../DESIGN-SYSTEM.md`; por isso há utilitários como `text-text`.

-   **Conteúdo claro:** `background #ebe9e2`, `surface #f5f3ed`, `surface-raised #fbfaf6`, `text #17181c`, `text-muted #6b6a66`, `border #d9d6cc`, `primary #17181c`, `primary-foreground`, `accent #d6452b` (vermelho Bauhaus, usado no coração de favorito), `success`, `warning`, `danger`, `focus-ring #3b6fd8`.
-   **Sidebar:** `sidebar`, `sidebar-raised`, `sidebar-text`, `sidebar-muted`, `sidebar-border`.
-   **Telas escuras** (login, lightbox, imagem de destaque): `night`, `night-surface`, `night-border`, `night-text`, `night-muted`, `night-danger` (um tom claro de vermelho para contraste sobre fundo escuro).
-   Há **um único tema**. Para novos temas, redefina os mesmos tokens num seletor (por exemplo `[data-theme="x"]`); nenhum componente usa cores literais. Não foi construído seletor de tema (fora de escopo, conforme `CLAUDE.md`).

## Tipografia

`next/font/google`: **Newsreader** (serifa; variável `--font-serif`, classe `font-serif`) para títulos e nomes; **Inter** (sans; `--font-sans`) para interface. Tamanhos pelas escalas do Tailwind; texto corrido a 15 px com `leading-relaxed` e largura limitada (`max-w-prose`).

## Componentes base (`frontend/components/ui/`)

`Button`/`LinkButton` (variantes `primary`, `secondary`, `danger`, `night`), `TextField`/`TextAreaField` (tons `light` e `night`, com erro `role="alert"`), `ChipCheckboxes`, `ImageField`, `Tabs`, `EmptySection`, `Form` (ver README do frontend), `Pagination`, e as camadas de sobreposição: **`Modal`** (elemento `<dialog>` nativo; título, botão fechar, `Esc` e clique no fundo fecham; o conteúdo só é montado enquanto aberto, o que reinicia formulários), **`ConfirmDialog`** (confirmação de ações destrutivas, substitui o `confirm()` do navegador) e **`ActionMenu`** (menu "⋯" com `role="menu"`, setas, `Esc` e clique fora). O lightbox de imagens usa o `<dialog>` escuro próprio. Identidade: `components/brand/Logo.tsx` e `PrismMark.tsx` (prisma facetado em SVG inline, inspirado no logotipo do mockup).

## Comportamento

-   **Responsivo:** grades de 1 a 4 colunas conforme a largura; sidebar vira barra superior com menu abaixo de `md`; login empilha as colunas.
-   **Acessibilidade:** foco visível global (`:focus-visible`), `aria-current`, `aria-pressed`, abas com ARIA, rótulos em botões de ícone, diálogos nativos, erros anunciados por `role="alert"`; estados que não dependem só de cor (texto/ícone/borda). Contraste não foi medido formalmente.
-   **Movimento:** transições curtas; `prefers-reduced-motion` reduz animações globalmente.
-   **Estados:** carregamento (esqueleto), vazio, erro e sucesso estão definidos por tela (ver cada documento).

## Limitações

-   Sem Storybook ou catálogo de componentes.
-   Sem tema alternativo e sem modo claro/escuro automático.
-   Em 2026-10-08 as telas foram conferidas por capturas reais (Playwright) contra o mockup: composição, sidebar, cards e login coerentes; diferenças conhecidas: sem "Esqueceu a senha?"/Google, sem retratos reais (fallback escuro com inicial) e avatar do rodapé simplificado.
-   A semelhança com os mockups é por composição, não por medidas exatas; o login não reproduz o botão "Google" nem "Esqueceu a senha?".
-   `ReferenceGallery` e o lightbox usam as cores `night-*` (escuro) mesmo nas telas claras.
