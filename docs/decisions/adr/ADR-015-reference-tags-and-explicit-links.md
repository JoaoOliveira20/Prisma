# ADR-015: Vínculo explícito entre imagem e conteúdo, tags próprias nas imagens

-   **Data:** 2026-10-08
-   **Status:** aceita
-   **Complementa:** [ADR-005](ADR-005-polymorphic-references.md) (vínculo polimórfico) e [ADR-010](ADR-010-owned-controlled-tags.md) (tags controladas).

## Contexto

Os cartões da biblioteca mostravam tags **emprestadas** dos conteúdos vinculados, o que não descreve a imagem em si (dois cartazes do mesmo estilo teriam as mesmas tags). Surgiu a pergunta: o vínculo imagem → estilo deveria passar a ser feito por tag?

## Decisão

1.  **O vínculo com estilo, pessoa e estratégia continua explícito** (tabela polimórfica `referenceables`). Tag não substitui vínculo.
2.  **Imagens ganham tags próprias**, escolhidas entre as tags controladas existentes (pivô `reference_item_tag`, migration nova e aditiva). Descrevem a imagem (cor, composição, "cartaz"), independente de a quem ela pertence. Os cartões mostram até 3; o lightbox mostra todas; clicar numa tag abre `/referencias?tag=slug`. A biblioteca filtra por tag para referências **e** para capas/fotos (pelas tags do conteúdo).
3. **Vincular ficou mais rápido**: seletor com busca (`EntityPicker`, sem o limite de 100 itens) no formulário e em "Vincular a…"; busca no painel "Vincular imagem existente"; **seleção em lote** na biblioteca (`POST /references/links`) e "Vincular a…" no menu do lightbox.

## Justificativa

-   Tag é vocabulário (muitos conteúdos a compartilham); estilo é entidade com história e pessoas. Vincular por tag tornaria o vínculo indireto e ambíguo, e quebraria "Ver todas as referências de um estilo", os filtros por pessoa/estratégia e "uma coisa → várias dimensões".
-   Tags próprias dão informação nova ao cartão e viram ferramenta de descoberta; as emprestadas apenas repetiam o conteúdo.
-   Regra do produto mantida: tags nunca nascem de texto livre.

## Consequências

-   Referências existentes não têm tags até serem editadas (o seeder passa a copiar as tags do estilo para as referências de demonstração; no banco já existente isso foi feito uma vez à mão).
-   Tag usada só por referência passa a contar como "em uso" (não pode ser excluída; `usage_count` inclui referências).
-   A migration é **nova** e não altera as existentes, então não exige `migrate:fresh` (o [ADR-008](ADR-008-pre-release-migrations.md) vale para alterações de tabelas já criadas).
-   Editar uma referência vinculada a conteúdo de outra pessoa devolve 403 (o seletor envia todos os vínculos); antes, esses vínculos eram removidos em silêncio.

## Alternativas consideradas

-   **Vínculo por tag** (a tag "Bauhaus" liga a imagem ao estilo): rejeitada pelos motivos acima.
-   **Manter tags emprestadas**: mais simples, mas sem informação própria da imagem.
-   **Sugerir vínculos a partir de tags em comum** e **destacar/ordenar imagens na prévia**: não implementados; seguem como próximos passos possíveis.

## Reconsiderar quando

Houver muitas imagens sem vínculo (aí, sugestões por tag) ou necessidade de curadoria manual da prévia.
