# Arquitetura

**Situação:** implementada. **Última verificação:** 2026-10-08.

## Visão geral

O Prisma é uma enciclopédia visual pessoal (ver `../../IDEIA.md`). São duas aplicações independentes no mesmo repositório:

| Parte | Tecnologia | Responsabilidade |
| --- | --- | --- |
| `backend/` | Laravel 13, PHP 8.3, MySQL 8, Sanctum | API REST, persistência, validação, autorização, armazenamento de arquivos |
| `frontend/` | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 | Interface, navegação, sessão do usuário |
| `docs/` | Markdown | Intenção do produto, convenções, decisões, referências visuais |

O navegador fala **apenas com o Next.js**. O Next.js fala com a API Laravel pelo servidor (ver [integração](frontend-backend-integration.md)). Imagens enviadas são servidas diretamente pelo Laravel (ver [armazenamento de imagens](../backend/image-storage.md)).

## Domínio

Tipos de conteúdo: **estilos**, **pessoas**, **estratégias** e **referências visuais**, mais **tags** (vocabulário controlado) e **grupos** (coleções pessoais, incluindo o grupo padrão Favoritos). Relações: pessoas e estratégias ↔ estilos; referências ↔ qualquer um dos três; tags em estilos, pessoas e estratégias. Detalhes em [banco de dados](../backend/database.md).

## Mapa do repositório

-   `backend/app/Http/Controllers/Api/`: um controller por recurso.
-   `backend/app/Models/` e `Models/Concerns/`: modelos e comportamentos compartilhados.
-   `backend/routes/api.php`: todas as rotas da API.
-   `frontend/app/(auth)` e `frontend/app/(app)`: telas públicas e autenticadas.
-   `frontend/app/actions/`: Server Actions (mutações).
-   `frontend/lib/`: acesso à API, sessão, mapeamentos de conteúdo.
-   `frontend/components/`: componentes por domínio.
-   `docs/assets/`: imagens de **referência de desenvolvimento** (não usadas pelo app).
-   `frontend/public/images/backgrounds/`: imagens **usadas pelo app**.

## Decisões de arquitetura

-   [ADR-001 Estratégia de autenticação](../adr/ADR-001-authentication-strategy.md)
-   [ADR-003 Integração frontend ↔ backend](../adr/ADR-003-frontend-backend-integration.md)
-   [ADR-005 Referências polimórficas](../adr/ADR-005-polymorphic-references.md)
-   [ADR-008 Migrations editadas no lugar antes do primeiro release](../adr/ADR-008-pre-release-migrations.md) (encerrada; ver [ADR-019](../adr/ADR-019-one-table-per-migration.md))
