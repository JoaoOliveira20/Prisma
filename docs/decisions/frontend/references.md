# Referências visuais e biblioteca de imagens

**Situação:** implementada. Decisões: [ADR-005](../adr/ADR-005-polymorphic-references.md), [ADR-002](../adr/ADR-002-image-storage.md), [ADR-012](../adr/ADR-012-unified-image-library.md). Backend: [api-structure.md](../backend/api-structure.md), [image-storage.md](../backend/image-storage.md).

## Objetivo

Formar uma **biblioteca visual** do sistema, não só uma imagem de capa (`../../IDEIA.md`). Uma **referência** é uma imagem (arquivo enviado ou URL) com título, descrição, crédito e fonte, que pode inspirar ou ilustrar **vários** estilos, pessoas e estratégias ao mesmo tempo.

## Página `/referencias` (biblioteca visual)

`app/(app)/referencias/page.tsx` ([ADR-016](../adr/ADR-016-reference-library-as-visual-archive.md)). Mostra **todas as imagens do sistema** (referências, capas de estilos e estratégias, fotos de pessoas; `GET /images`). A imagem é o conteúdo: não há cartão com moldura.

**Estrutura, de cima para baixo**

1.  **Cabeçalho compacto:** filete + "Biblioteca visual", título, uma frase (oculta no mobile), a **contagem ao vivo** em serifa grande (`aria-live`) e "Nova referência".
2.  **Contexto** (`FilterContext`), só quando se chega de um estilo, pessoa ou estratégia: "Filtrando por estilo" com o nome em serifa, "Abrir estilo" e "Remover filtro".
3.  **Ferramentas** (`LibraryShell`, componente cliente que escreve na URL com `router.replace`): busca **ao vivo** (350 ms, Enter aplica na hora, "×" limpa; casa título, descrição, crédito, fonte, **tags** e **nomes de estilos, pessoas e estratégias vinculados**), botão **Filtros** com contador (painel que expande, com `inert` quando fechado: Estilo, Pessoa, Estratégia, Tag, Coleção e "só o que eu criei"), **ordem** (mais recentes/mais antigas), abas de origem (Todas, Referências, Estilos, Pessoas, Estratégias; ocultas quando o contexto é pessoa/estratégia) e **chips dos filtros ativos** removíveis, com "Limpar tudo". "Coleção" cobre Favoritos e grupos (`group=id`, só grupos do próprio usuário). Enquanto a navegação carrega, os resultados ficam a 50% de opacidade (`aria-busy`).
4.  **Última adição** (`FeaturedReference`), só na página 1 sem filtros e se a imagem mais recente for uma referência: imagem grande + título, descrição, "Faz parte de …" e "Abrir referência".
5.  **Mosaico** (`ReferenceGallery`): colunas ("masonry", 2 no mobile até 5 em telas largas) com a proporção real de cada imagem, sem moldura, legenda de **uma linha** (eyebrow com os conteúdos vinculados + título em serifa, que leva à página da referência). No hover/foco aparecem, sem painel: as **tags** (degradê leve no pé da imagem), o coração e "salvar em grupo" (sempre visíveis em telas sem hover); o cursor é de ampliar. Clicar na imagem abre o lightbox (visualização rápida, com setas e "Abrir página da referência"). "Selecionar imagens" (texto discreto) ativa a seleção em lote.
6.  **Estados:** vazio (`LibraryEmpty`, "O repertório começa com uma imagem", explica as conexões e oferece adicionar ou explorar estilos), **sem resultados** (diz o termo, explica o que a busca cobre e oferece voltar à biblioteca inteira) e carregamento (esqueleto da área do app).

**Movimento:** entrada da página e dos resultados (`.results-in`), revelação por rolagem dos tiles (CSS, sem JS e sem stagger por item), fade ao carregar a imagem, zoom de 2% no hover, painel de filtros que expande, chips que entram; `prefers-reduced-motion` respeitado.

**Escala:** paginação de 48 (sem rolagem infinita nem virtualização: a página fica sempre leve) e carregamento preguiçoso do `next/image`. **Limitações:** as imagens são servidas no tamanho original (sem miniaturas geradas pelo backend) e os seletores de filtro listam até 100 estilos/pessoas/estratégias; com muito mais que isso será preciso gerar miniaturas e trocar os seletores por busca.

## Página da referência `/referencias/[id]`

Imagem grande à esquerda; à direita, data de adição, título, descrição, crédito e fonte (domínio com link), **tags** (links para a biblioteca filtrada) e as ações (favoritar, salvar em grupo e, para o dono, Editar, Vincular a… e Remover). Abaixo, **"Faz parte de"**: cada estilo, pessoa e estratégia vinculados como uma linha grande em serifa (mais "Nas suas coleções", com os grupos), e **"Mais como esta"**: até 8 outras referências que compartilham algum vínculo ou tag (ordenadas por quantos compartilham, depois pelas mais recentes), calculadas no backend (`related` em `GET /references/{id}`).

## Tags nas imagens

Referências têm **tags próprias** ([ADR-015](../adr/ADR-015-reference-tags-and-explicit-links.md)); capas e fotos mostram as tags do conteúdo. Aparecem no hover do mosaico (até 3), no lightbox e na página da referência (`TagChips`, links para `/referencias?tag=slug`).

## Vincular a conteúdos

-   **Formulário** (`ReferenceModal`): "Vincular a" usa `EntityPicker` (campo com busca, resultados de estilos, pessoas e estratégias **do próprio usuário**, via `app/api/link-options?q=`, chips removíveis, navegação por setas/Enter) e "Tags da imagem" (chips, `app/api/tag-options`).
-   **Vincular imagem existente** (`LinkExistingPanel`): agora com busca por título/crédito.
-   **Lote:** na biblioteca e nas páginas de referências de um conteúdo, "Selecionar imagens" ativa a seleção (só imagens próprias); "Vincular a…" abre `LinkReferencesModal` e chama `POST /references/links`.
-   **Individual:** menu "⋯" do lightbox → "Vincular a…" (só para imagens próprias).

## Modal de referência (`components/references/ReferenceModal.tsx`)

Um só componente para **criar** e **editar**, aberto de três lugares (biblioteca, seção Referências de um conteúdo, menu da imagem):

-   Campos: título, descrição, crédito, fonte; na criação, **arquivo ou URL** da imagem. Na edição a imagem não muda.
-   **Vínculos:** na biblioteca e na edição aparecem caixas para estilos, pessoas e estratégias (só os **seus**; a lista é carregada ao abrir o modal por `app/api/link-options/route.ts`). Aberto a partir de um conteúdo, o vínculo àquele conteúdo já vem fixo.
-   Erros por campo e geral; **o digitado é preservado** (`components/ui/Form.tsx`). Ao salvar com sucesso o modal fecha e a página revalida.

## Seção Referências de um conteúdo (`components/references/AddReferenceButton.tsx`)

Na página de detalhe, a dimensão **Referências** mostra uma **prévia** (as 8 mais recentes) em mosaico, com "Ver todas as N referências" para a página própria do conteúdo (`/estilos|pessoas|estrategias/[slug]/referencias`, só imagens; ver [ADR-014](../adr/ADR-014-dimension-portals.md)). A biblioteca geral também aceita `style`, `person` e `strategy` e exibe a faixa "Filtrando por …". A prévia e, para o dono, o botão **Adicionar referência** no rótulo da seção, que abre o modal com duas abas: **Enviar nova imagem** e **Vincular imagem existente** (`LinkExistingPanel`): lista as referências do próprio usuário que ainda não estão vinculadas àquele conteúdo (carregadas por `app/api/my-references/route.ts`), com seleção múltipla. É assim que **uma mesma imagem passa a ilustrar mais de um estilo**. Vínculos individuais também podem ser removidos pela edição.

## Visualização (lightbox) — `ReferenceGallery.tsx`

Clique abre um diálogo escuro com a imagem grande e **navegação entre as imagens**: botões laterais ("Imagem anterior"/"Próxima imagem", visíveis no hover/foco), setas ← → do teclado (ciclo nas pontas) e o contador "3 de 15" no rótulo. Mostra também título, descrição, crédito, "Ver fonte" (nova aba, `rel="noopener noreferrer"`) e os **conteúdos vinculados** como links. Para **referências**: coração de favorito e menu "⋯" (Salvar em grupo, Editar, Remover, conforme permissão). Para capas e fotos de outros tipos: link "Abrir estilo/pessoa/estratégia"; não há ações de edição aqui (editam-se na página do próprio conteúdo). Remover pede **confirmação em modal** (`ConfirmDialog`).

O mesmo componente é usado na biblioteca, nas seções de conteúdo, na coleção e no Explorar; ele recebe a lista de grupos por prop (carregue `getGroups()` ao usá-lo).

## Fluxo de criação

1.  `createReference` (`app/actions/references.ts`) monta um multipart para `POST /references` (arquivo **ou** URL, descrição, crédito, fonte, `links[i][type|slug]`).
2.  A API valida (imagem ou URL obrigatória, arquivo ≤ 5 MB e só imagens) e exige que o usuário seja dono de cada conteúdo vinculado (403 → "Você só pode vincular referências a conteúdos que criou.").
3.  Edição: `updateReference` (`PUT /references/{id}`, vínculos **substituídos**). Vincular existente: `linkReferences` (`POST /references/{id}/links`, um por vez, sem afetar os demais vínculos).

## Decisões

-   **Biblioteca única, de todos os usuários**, com filtro "só o que eu criei", em vez de listar só o que o usuário adicionou: o produto é uma enciclopédia visual e capas/fotos também são imagens do acervo.
-   **Vínculos só a conteúdos próprios** ([ADR-007](../adr/ADR-007-content-ownership.md)): evita que alguém acrescente imagens à página de outro usuário. Consequência: nos estilos de demonstração (do usuário demo) só o demo vincula.
-   **Modais em vez de formulários na página** e opções de vínculo carregadas sob demanda: a página não paga o custo de listar todos os conteúdos e o formulário não ocupa espaço.
-   Capas e fotos não são "referências": não se editam nem se favoritam pela biblioteca; não há como transformá-las em referência.
-   `next/image` com `unoptimized` para aceitar qualquer origem.

## Limitações

-   Imagem de referência não pode ser trocada depois de criada (remover e recriar).
-   Falha de carregamento de imagem externa não tem fallback.
-   A lista de vínculo carrega no máximo 100 conteúdos por tipo.
-   Estilos e pessoas **sem imagem** não aparecem na biblioteca.
