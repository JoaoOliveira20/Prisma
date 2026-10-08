# ADR-005: Referências com relação polimórfica

-   **Data:** 2026-10-08
-   **Status:** aceita
-   **Substitui:** tabela pivô `reference_item_style` (referência ↔ estilo apenas).

## Contexto

`../../IDEIA.md`: "uma referência pode se relacionar com mais de um estilo, pessoa ou estratégia". A primeira versão só ligava referências a estilos, porque pessoas e estratégias ainda não existiam.

## Decisão

Tabela `referenceables` (`reference_item_id` + `referenceable_type`/`referenceable_id`). Os tipos usam o morph map `style`, `person`, `strategy`. Estilos, pessoas e estratégias têm `references()` pelo trait `HasReferences`. Uma referência pertence a quem a criou e só pode ser vinculada a conteúdos do mesmo usuário (ADR-007).

## Justificativa

Uma tabela atende os três tipos e novos tipos futuros, sem tabelas pivô por par.

## Consequências

-   Sem chave estrangeira para o item vinculado (limitação de relações polimórficas): por isso os traits `HasReferences` e `Groupable` removem os vínculos no evento `deleting` do modelo. Exclusões feitas fora do Eloquent (SQL direto) deixariam registros órfãos.
-   A referência em si **não é apagada** ao excluir o conteúdo vinculado; ela continua na biblioteca `/referencias`, sem vínculos.
-   O morph map é obrigatório (`Relation::enforceMorphMap`); novos tipos precisam ser registrados em `AppServiceProvider`.

## Referências

-   [Banco de dados](../backend/database.md), [Referências no frontend](../frontend/references.md)
-   `backend/app/Models/ReferenceItem.php`, `backend/app/Models/Concerns/HasReferences.php`
