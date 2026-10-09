# ADR-008: Migrations editadas no lugar antes do primeiro release

-   **Data:** 2026-10-08
-   **Status:** encerrada em 2026-10-09 (já há contas com dados); a convenção vigente é o [ADR-019](ADR-019-one-table-per-migration.md)

## Contexto

Durante a primeira semana de desenvolvimento o esquema mudou várias vezes (favoritos → grupos, referências → polimórficas, colunas de imagem). Não existe ambiente com dados reais.

## Decisão

Até haver dados que precisem ser preservados, migrations existentes são **editadas diretamente** e o banco é recriado com `kool run artisan migrate:fresh --seed`. Não são criadas migrations de alteração.

## Justificativa

Mantém o histórico de migrations curto e legível; nenhum dado a proteger.

## Consequências

-   Quem tem um banco local antigo precisa recriá-lo após cada atualização do repositório que altere migrations.
-   **Esta política deve terminar** assim que houver dados a preservar (primeira implantação ou uso real contínuo): a partir daí, apenas migrations novas, e este ADR deve ser marcado como substituído.

## Referências

-   [Banco de dados](../backend/database.md)
