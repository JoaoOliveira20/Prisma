# Documentação de funcionamento e decisões

Este diretório responde a duas perguntas sobre o Prisma:

1.  **Como cada parte funciona hoje?** Documentos por área, em `architecture/`, `backend/`, `frontend/` e `infrastructure/`.
2.  **Por que foi construída assim?** Cada documento registra suas decisões; as de maior impacto também têm um ADR em `adr/`, com histórico preservado.

As capturas de tela usadas no `README.md` da raiz ficam em `docs/screenshots/` (diferente de `docs/assets/`, que guarda referências visuais, e de `frontend/public/images/`, que guarda imagens do app). São geradas com `yarn screenshots`, em `frontend/`, sobre um banco recém-populado pelo seed.

Os documentos de `docs/` na raiz têm outro papel: `IDEIA.md` registra a intenção do produto; `FRONTEND.md`, `BACKEND.md` e `DESIGN-SYSTEM.md` são convenções de código; `TASKS.md` é o quadro de tarefas. Aqui fica o que **foi de fato implementado** e o porquê.

> Estes documentos descrevem o código real na data indicada em cada um. Antes de confiar neles, confira a implementação; se divergirem, o código vence e o documento deve ser corrigido na mesma etapa.

## Como usar

-   **Antes de alterar uma área:** leia o documento da área e o das dependências diretas, e consulte os ADRs relacionados.
-   **Depois de alterar:** atualize o documento da área, os ADRs afetados e este índice (regras completas em `../../CLAUDE.md`).
-   **Decisão substituída:** nunca apague o ADR antigo; marque-o como substituído e aponte para o novo.

## Índice

### Arquitetura (`architecture/`)

-   [Visão geral](architecture/README.md): componentes, responsabilidades e mapa do repositório.
-   [Integração frontend ↔ backend](architecture/frontend-backend-integration.md)

### Backend (`backend/`)

-   [Visão geral e testes](backend/README.md)
-   [Autenticação](backend/authentication.md)
-   [Autorização e propriedade](backend/authorization.md)
-   [Estrutura da API](backend/api-structure.md): endpoints, validação, respostas, idioma das mensagens
-   [Banco de dados e modelos](backend/database.md)
-   [Armazenamento de imagens](backend/image-storage.md)
-   [Grupos e favoritos](backend/groups-and-favorites.md)

### Frontend (`frontend/`)

-   [Visão geral e estrutura](frontend/README.md)
-   [Autenticação (login e cadastro)](frontend/authentication.md)
-   [Navegação e sidebar](frontend/navigation.md)
-   [Tags](frontend/tags.md)
-   [Pesquisa global](frontend/global-search.md)
-   [Páginas de conteúdo](frontend/content-pages.md): início, listagens, cards e detalhes
-   [Formulários de conteúdo](frontend/content-forms.md)
-   [Referências visuais e biblioteca de imagens](frontend/references.md)
-   [Grupos e favoritos](frontend/groups-and-favorites.md)
-   [Design system e identidade visual](frontend/design-system.md)
-   [Testes automatizados (E2E)](frontend/testing.md)

### Infraestrutura (`infrastructure/`)

-   [Ambiente de desenvolvimento](infrastructure/development-environment.md)
-   [Kool](infrastructure/kool.md)

### Decisões (ADRs, `adr/`)

Lista completa e status em [adr/README.md](adr/README.md).

## Áreas ainda sem documentação própria

Por não existirem (ou ainda não terem decisões a registrar):

-   Recuperação de senha (não implementada).
-   Mesclagem e moderação de tags (ver limitações em `frontend/tags.md`).
-   Compartilhamento e publicação de conteúdo (previstos em `../IDEIA.md`, não implementados).
-   Implantação em servidor remoto (não iniciada).
-   Outros idiomas além do português (a API só tem pt_BR; ver ADR-009).
