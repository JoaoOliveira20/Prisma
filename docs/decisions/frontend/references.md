# Referências visuais e biblioteca de imagens

**Situação:** implementada. Decisões: [ADR-005](../adr/ADR-005-polymorphic-references.md), [ADR-002](../adr/ADR-002-image-storage.md), [ADR-012](../adr/ADR-012-unified-image-library.md). Backend: [api-structure.md](../backend/api-structure.md), [image-storage.md](../backend/image-storage.md).

## Objetivo

Formar uma **biblioteca visual** do sistema, não só uma imagem de capa (`../../IDEIA.md`). Uma **referência** é uma imagem (arquivo enviado ou URL) com título, descrição, crédito e fonte, que pode inspirar ou ilustrar **vários** estilos, pessoas e estratégias ao mesmo tempo.

## Página `/referencias` (biblioteca)

`app/(app)/referencias/page.tsx`. Mostra **todas as imagens do sistema**, de todos os usuários: referências **e** as capas de estilos e estratégias e as fotos de pessoas (consulta unificada `GET /images`). Em colunas ("masonry"), cada imagem tem **título e uma curta descrição** embaixo; imagens que não são referências mostram a origem ("Estilo", "Pessoa", "Estratégia").

Filtros (`components/references/ImageFilters.tsx`, tudo por URL, sem JavaScript): **origem** (Todas, Referências, Estilos, Pessoas, Estratégias), **busca** (título, descrição, crédito), **estilo** (mostra o que se relaciona àquele estilo: a capa dele, referências vinculadas e imagens de pessoas e estratégias ligadas a ele) e **"só o que eu criei"**. Paginação de 48 por página; página inexistente volta para a última.

Botão **Nova referência** (`NewReferenceButton`) abre o modal de criação.

## Modal de referência (`components/references/ReferenceModal.tsx`)

Um só componente para **criar** e **editar**, aberto de três lugares (biblioteca, aba Referências de um conteúdo, menu da imagem):

-   Campos: título, descrição, crédito, fonte; na criação, **arquivo ou URL** da imagem. Na edição a imagem não muda.
-   **Vínculos:** na biblioteca e na edição aparecem caixas para estilos, pessoas e estratégias (só os **seus**; a lista é carregada ao abrir o modal por `app/api/link-options/route.ts`). Aberto a partir de um conteúdo, o vínculo àquele conteúdo já vem fixo.
-   Erros por campo e geral; **o digitado é preservado** (`components/ui/Form.tsx`). Ao salvar com sucesso o modal fecha e a página revalida.

## Aba Referências de um conteúdo (`components/references/EntityReferences.tsx`)

O dono do conteúdo vê o botão **Adicionar referência**, que abre o modal com duas abas: **Enviar nova imagem** e **Vincular imagem existente** (`LinkExistingPanel`): lista as referências do próprio usuário que ainda não estão vinculadas àquele conteúdo (carregadas por `app/api/my-references/route.ts`), com seleção múltipla. É assim que **uma mesma imagem passa a ilustrar mais de um estilo**. Vínculos individuais também podem ser removidos pela edição.

## Visualização (lightbox) — `ReferenceGallery.tsx`

Clique abre um diálogo escuro com a imagem grande, título, descrição, crédito, "Ver fonte" (nova aba, `rel="noopener noreferrer"`) e os **conteúdos vinculados** como links. Para **referências**: coração de favorito e menu "⋯" (Salvar em grupo, Editar, Remover, conforme permissão). Para capas e fotos de outros tipos: link "Abrir estilo/pessoa/estratégia"; não há ações de edição aqui (editam-se na página do próprio conteúdo). Remover pede **confirmação em modal** (`ConfirmDialog`).

O mesmo componente é usado na biblioteca, nas abas de conteúdo, no grupo e no Explorar; ele recebe a lista de grupos por prop (carregue `getGroups()` ao usá-lo).

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

-   O lightbox não tem navegação anterior/próxima.
-   Imagem de referência não pode ser trocada depois de criada (remover e recriar).
-   Falha de carregamento de imagem externa não tem fallback.
-   A lista de vínculo carrega no máximo 100 conteúdos por tipo.
-   Estilos e pessoas **sem imagem** não aparecem na biblioteca.
