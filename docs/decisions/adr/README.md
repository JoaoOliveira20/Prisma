# ADRs: registros de decisões de arquitetura

Um ADR registra uma decisão de **arquitetura, segurança, infraestrutura ou persistência** com impacto duradouro. Não há ADR para componentes ou ajustes visuais; esses ficam nos documentos de cada área.

**Status possíveis:** proposta, aceita, substituída, rejeitada. ADRs substituídos permanecem aqui, apontando para quem os substituiu.

**Nota sobre autoria:** até 2026-10-08 as decisões abaixo foram tomadas pelo agente de IA durante a implementação, a partir de `../../IDEIA.md`, `BACKEND.md`, `FRONTEND.md` e `CLAUDE.md`, e aceitas pelo responsável do projeto ao aprovar o resultado. Quando a motivação não foi discutida com o responsável, o ADR diz isso.

| ADR | Título | Status |
| --- | --- | --- |
| [001](ADR-001-authentication-strategy.md) | Autenticação por token Sanctum em cookie `httpOnly` | Aceita |
| [002](ADR-002-image-storage.md) | Imagens enviadas no disco público do Laravel | Aceita |
| [003](ADR-003-frontend-backend-integration.md) | Chamadas à API somente pelo servidor do Next.js | Aceita |
| [004](ADR-004-favorites-as-groups.md) | Favoritos modelados como um grupo | Aceita (substitui a tabela `favorites` inicial) |
| [005](ADR-005-polymorphic-references.md) | Referências com relação polimórfica | Aceita (substitui o vínculo só com estilos) |
| [006](ADR-006-kool-development-environment.md) | Kool como ambiente de desenvolvimento do backend | Aceita |
| [007](ADR-007-content-ownership.md) | Leitura para autenticados, escrita só do dono | Substituída pelo 018 |
| [008](ADR-008-pre-release-migrations.md) | Migrations editadas no lugar antes do primeiro release | Encerrada (substituída pelo 019) |
| [009](ADR-009-handwritten-translations.md) | Traduções pt_BR da API mantidas à mão | Aceita |
| [010](ADR-010-owned-controlled-tags.md) | Tags controladas com dono | Aceita |
| [011](ADR-011-playwright-e2e.md) | Testes ponta a ponta do frontend com Playwright | Aceita |
| [012](ADR-012-unified-image-library.md) | Biblioteca de imagens como consulta unificada | Aceita |
| [013](ADR-013-editorial-archive-direction.md) | Direção visual "arquivo editorial" | Aceita (substitui visualmente o desenho de catálogo inicial; detalhes parcialmente revistos pelo 014) |
| [014](ADR-014-dimension-portals.md) | Dimensões como conteúdo, portais ou relações | Aceita (substitui parcialmente o 013) |
| [015](ADR-015-reference-tags-and-explicit-links.md) | Vínculo explícito imagem↔conteúdo e tags próprias nas imagens | Aceita |
| [016](ADR-016-reference-library-as-visual-archive.md) | Biblioteca de referências como arquivo visual | Aceita |
| [017](ADR-017-sidebar-as-archive-index.md) | Sidebar como índice do arquivo | Aceita |
| [018](ADR-018-private-workspace-per-account.md) | Cada conta é um acervo privado | Aceita (substitui o 007) |
| [019](ADR-019-one-table-per-migration.md) | Uma migration por tabela e histórico imutável | Aceita |
| [020](ADR-020-sliding-session.md) | Sessão de 1 dia renovada pelo uso | Aceita (altera o 001) |

## Modelo

Cada ADR contém: título, data, status, contexto, decisão, justificativa, consequências, alternativas consideradas e referências.
