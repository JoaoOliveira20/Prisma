# Design system e identidade visual

**Situação:** implementada (tokens + componentes próprios). Princípios gerais: `../../DESIGN-SYSTEM.md`. Decisão de direção: [ADR-013](../adr/ADR-013-editorial-archive-direction.md). Última revisão: 2026-10-08.

## Identidade

"PRISMA: uma coisa → várias dimensões." Um **arquivo visual editorial**: papel claro e quente, tipografia serifada em escala grande, filetes finos no lugar de caixas, imagens como protagonistas. A navegação é uma **sidebar escura** em índice; o conteúdo vive sobre o papel. A cor da interface é quase só grafite e cinza quente; o espectro aparece como um **filete de 2 px** (marcador) e nas próprias imagens.

O que a identidade evita: aparência de painel/SaaS (cartões iguais, pílulas, sombras, cantos arredondados), gradientes decorativos, neon, ícones em excesso. Cada tipo de conteúdo tem composição própria (ver [content-pages.md](content-pages.md)).

## Referências visuais (somente desenvolvimento)

Em `docs/assets/` (não carregadas pelo app): `screens/PRISMA_telas_preview.png` (12 telas de referência, usadas como guia de composição, não como especificação) e dois fundos (`backgrounds/`). Cópias usadas pelo app, em `frontend/public/images/backgrounds/`: `prism-beam.png` (arte única do login) e `prism-light-dark.png` (sem uso atual).

**Ícone do site (favicon):** o símbolo do prisma (o mesmo SVG do `PrismMark`) em `frontend/app/icon.svg` (navegadores modernos), `app/favicon.ico` (16 e 32 px, para navegadores sem suporte a SVG, como o Safari) e `app/apple-icon.png` (180 px, sobre fundo `sidebar`). Os arquivos seguem a convenção do App Router, que gera as tags `<link>`. O `proxy.ts` os exclui da exigência de login (senão a tela de login não conseguiria buscá-los). Os PNG/ICO foram gerados a partir do SVG; ao mudar o símbolo, regenere os três.

Arte de demonstração: SVGs originais em `backend/database/seeders/images/` (estilos, estratégias e referências do seed). São exemplos, não identidade.

## Tokens (`frontend/app/globals.css`, `@theme`)

Nenhum componente usa cor literal. Nomes seguem `../../DESIGN-SYSTEM.md` (por isso existem utilitários como `text-text`).

| Token | Hex | Uso |
| --- | --- | --- |
| `background` | `#f3f1eb` | Papel: fundo da página |
| `surface` | `#e8e5dc` | Placas de imagem, fundo de placeholders |
| `surface-raised` | `#fbfaf7` | Campos, modais, menus |
| `text` | `#15161a` | Texto principal |
| `text-muted` | `#5c5b56` | Texto secundário (6,0:1 sobre `background`) |
| `border` | `#d5d2c8` | **Filetes decorativos** (divisores, seções) |
| `border-strong` | `#86847c` | **Bordas de controle** (campos, botões, chips): 3,3:1 sobre `background` |
| `primary` / `primary-foreground` | `#15161a` / `#f3f1eb` | Botão principal, seleção |
| `accent` | `#b83a22` | Coração de favorito (5,1:1; pode ser texto) |
| `success`, `warning`, `danger` | `#2f7d4f`, `#b7791f`, `#b42318` | Estados |
| `focus-ring` | `#15161a` | Anel de foco (claro na sidebar e no login, ver `.night-scope`) |
| `sidebar*` | `#0d0e11` e derivados | Sidebar escura |
| `night*` | `#07080b` e derivados | Login e lightbox |

`.night-scope` redefine `--color-focus-ring` como o off-white `night-text` em superfícies escuras (sidebar, login, lightbox). Um único tema; novos temas = redefinir os mesmos tokens num seletor. Utilitários próprios em CSS: `.eyebrow`, `.page-x`, `.spectrum-rule`, `.tabular`, e as classes do login (ver [authentication.md](authentication.md)).

## Tipografia

`next/font/google`: **Newsreader** (serifa, `font-serif`) para títulos e nomes; **Inter** (sans) para interface. Fontes variáveis, sem itálico.

| Papel | Estilo |
| --- | --- |
| Título de página | serifa, `text-5xl sm:text-6xl`, `leading-[1.02]`, `tracking-tight` |
| Título de detalhe | serifa, `text-5xl sm:text-6xl xl:text-7xl`, `leading-[0.98]` |
| Título de seção ("dimensão") | serifa, `text-3xl` (listas: `text-2xl`) + contagem tabular pequena |
| Título de tile | serifa, `text-2xl` |
| Nome em índice (estratégia, coleção, tag, dimensões do início) | serifa, `text-3xl` a `text-5xl` |
| Texto de abertura (primeiro parágrafo) | serifa, `text-2xl` |
| Texto corrido | sans, `text-lg leading-8` |
| Lede de página | sans, `text-base leading-relaxed`, `text-text-muted`, `max-w-xl` |
| **Eyebrow** | 11 px, caixa alta, espaçamento `0.14em`, `text-text-muted` |
| Metadados, tags (texto "A · B") | sans, `text-xs`/`text-sm`, `text-text-muted` |
| Campo de busca das listas | serifa, `text-lg`, só borda inferior |

Hierarquia por tamanho, família (serifa × sans) e cor (`text` × `text-muted`); sem negrito.

## Layout e espaçamento

-   **Margens da página:** `.page-x` = `padding-inline: clamp(1.5rem, 4vw, 3.5rem)`; conteúdo limitado a `max-w-[100rem]`.
-   **Cabeçalho de página** (`layout/PageHeader`): filete espectral + eyebrow, título grande, lede, ações à direita. Sem busca (ela está na sidebar).
-   **Seções:** filete superior (`border-t`), título e, quando cabe, "Ver todos →". Espaço entre seções `space-y-20` a `space-y-24`.
-   **Faixa de ferramentas** das listas: busca + ordenação + índice de tags, entre dois filetes.
-   **Grades por tipo:** *ritmo* assimétrico para estilos (colunas 7/5/4/4/4 que se repetem, com deslocamentos), *retratos* 4:5 para pessoas, *lista tipográfica* para estratégias, *masonry* em colunas para imagens, *mosaico* 2×2 para coleções. Ver [content-pages.md](content-pages.md).

## Forma

Cantos **retos** (`rounded-sm`, 2 px) em botões, campos, chips, menus, modais; imagens sem raio; círculos só em botões de ícone (coração, menu "⋯") e avatar da sidebar minimizada. Bordas finas; sombra só em modais e no menu "⋯". Filetes `border` para dividir, `border-strong` para controles.

## Imagens

-   Protagonistas: tiles com **legenda ao estilo museu** (eyebrow + título serifado + resumo + tags em texto), sem moldura nem cartão. Hover: zoom de 3% em 700 ms.
-   **Placa tipográfica** (`content/CoverImage`) quando não há imagem: a inicial em serifa gigante (`46cqw`) em `text-text/20` sobre `surface`. É intencional, não é erro.
-   Proporções: 4:3 (padrão), 3:2 e 4:5 conforme a posição no ritmo, 4:5 para pessoas, 21:9 não é mais usado. Imagens nunca são distorcidas (`object-cover`/`object-contain`).
-   O coração de favorito aparece só no hover/foco (e sempre em telas sem hover ou quando já está favoritado).
-   `next/image` com `unoptimized` (aceita qualquer origem).

## Componentes base (`frontend/components/ui/` e vizinhos)

`Button`/`LinkButton` (`primary`, `secondary` com borda forte e fundo transparente, `danger`, `night`; `rounded-sm`, `px-5 py-2.5`), `TextField`/`TextAreaField` (rótulo `text-sm` acima, borda `border-strong`, tom `night` no login), `ChipCheckboxes` (seleções retangulares), `ImageField` (com **pré-visualização**), `Form`, `FormLayout`/`FormSection`, `Pagination` (texto), `Modal`, `ConfirmDialog`, `ActionMenu` ("⋯"), `EmptySection`. De composição: `layout/` (`Sidebar`, `PageHeader`, `Section`, `DimensionSection`, `DetailHeader`, `SectionNav`), `content/` (`ImageTile`, `ContentGrid`, `StrategyList`, `CoverImage`, `ContentFilters` como índice de tags, `ListSearch`). `Tabs`, `ContentCard` e `DiscoverySection` deixaram de existir.

## Estados e interação

Hover: mudança de cor de texto/sublinhado ou zoom de imagem (nunca sombras). Foco: anel de 2 px (grafite no papel, off-white no escuro). Ativo: sublinhado de 2 px (filtros, índice) ou filete espectral (sidebar). Desabilitado: 50%. Pendente: rótulo muda e controle desabilita. Vazio: **frase em serifa**, sem caixa. Carregando: esqueleto de blocos em `border`. Erro/não encontrado: título grande em serifa com ação. Destrutivo: sempre `ConfirmDialog`.

## Movimento

Curto e com propósito: zoom de imagem, deslocamento de 4 a 8 px em índices tipográficos ao passar o mouse, e animações próprias da paleta e do formulário de login. `prefers-reduced-motion` reduz tudo a ~0 ms. Sem parallax e sem movimento contínuo.

## Responsividade

Breakpoints do Tailwind. **Sidebar fixa a partir de `lg` (1024 px)**; abaixo, barra superior com busca e menu (painel sobre o conteúdo, `Esc` fecha). Grades colapsam (ritmo: 1 coluna → 2 → 12-col em `lg`; masonry 2 → 3 → 4 colunas; retratos 2 → 3 → 4). O índice de dimensões do detalhe rola na horizontal. Textos longos sem espaços quebram (`overflow-wrap: anywhere` no `main`).

## Acessibilidade

Verificada automaticamente com axe (WCAG 2.0/2.1 A e AA) em todas as telas, no login e nas camadas abertas (paleta, modal, lightbox): **sem violações** (`e2e/accessibility.spec.ts`). Inclui: link "Pular para o conteúdo", níveis de título sem saltos (tiles são `h2` nas listagens e `h3` dentro de seções), foco visível, rótulos em todos os campos, `aria-current` na navegação e no índice de dimensões, diálogos nativos, teclado completo (menu, paleta, lightbox com setas). O axe **não** avalia contraste sobre imagens nem a qualidade de leitura real com leitores de tela.

## Limitações

-   Sem tema escuro completo; sem catálogo de componentes.
-   Muitas pessoas sem foto resultam em várias placas tipográficas iguais; retratos reais melhoram muito a página.
-   Imagens externas sem fallback de erro e sem otimização.
-   O desenho foi conferido em 1920, 1440, 1280, 1024, 820/768 e 390 px; larguras fora disso não foram verificadas.
