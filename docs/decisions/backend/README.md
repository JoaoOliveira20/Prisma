# Backend

**Situação:** implementada. **Última verificação:** 2026-10-08.

API REST em Laravel 13 (PHP 8.3), MySQL 8 e Sanctum, em `backend/`. Responsável por persistência, validação, autorização, relações entre conteúdos e arquivos enviados. Convenções gerais de código: `../../BACKEND.md`.

## Documentos

-   [Autenticação](authentication.md)
-   [Autorização e propriedade](authorization.md)
-   [Estrutura da API](api-structure.md)
-   [Banco de dados e modelos](database.md)
-   [Armazenamento de imagens](image-storage.md)
-   [Grupos e favoritos](groups-and-favorites.md)

## Organização do código

-   `routes/api.php`: todas as rotas, prefixadas por `/api`. `routes/web.php` só responde um JSON em `/`.
-   `app/Http/Controllers/Api/`: controllers finos, um por recurso.
-   `app/Http/Requests/`: validação (Form Requests). Nenhuma validação inline em controller, exceto filtros de listagem (`index`).
-   `app/Http/Resources/`: contrato JSON; é o único ponto que decide o que sai.
-   `app/Models/` e `app/Models/Concerns/`: modelos e traits (`Groupable`, `HasReferences`, `HasUniqueSlug`, `HasUploadedImage`, `Searchable`).
-   `app/Policies/`: autorização.
-   `lang/pt_BR/` e `lang/pt_BR.json`: traduções das mensagens ([ADR-009](../adr/ADR-009-handwritten-translations.md)).
-   `database/seeders/`: dados de demonstração (tags, 5 estilos, 6 pessoas, 5 estratégias, usuário demo).

## Testes

`kool run phpunit`: 47 testes de feature em `tests/Feature/` (autenticação, estilos, pessoas e estratégias, referências, grupos e favoritos, tags, seeder). Rodam com **SQLite em memória** (`phpunit.xml`), nunca tocam o MySQL de desenvolvimento. O armazenamento é simulado com `Storage::fake('public')`. Formatação: `kool run composer exec pint`.

## Lições registradas

-   Os testes rodam em SQLite e produção em MySQL: diferenças de `LIKE` (escape), collation e FKs já causaram surpresa. Para comportamento sensível a banco, confira também contra o MySQL real.

-   Eventos de modelo `deleting` são **interrompíveis**: se um listener retorna valor não nulo, os seguintes não executam. Closures registrados em `boot*` de traits devem declarar retorno `void` (aconteceu em `Groupable`; um teste cobre).
-   Atributos fora de `#[Fillable]` são descartados em silêncio por `update()`. Colunas controladas pelo sistema (`image_path`, `is_favorites`) são gravadas com `forceFill` ou `forceCreate`.
