# ADR-020: Sessão de 1 dia renovada pelo uso

-   **Data:** 2026-10-09
-   **Status:** aceita
-   **Altera:** a duração e a renovação descritas no [ADR-001](ADR-001-authentication-strategy.md) (antes: 30 dias fixos, sem renovação).

## Contexto

Com 30 dias fixos, um token vazado ou esquecido num computador compartilhado valia por muito tempo, e quem usava todo dia ainda era obrigado a entrar de novo ao fim do prazo. O responsável pediu sessão curta (1 dia) que se renove enquanto usa, sem sobrecarregar o backend.

## Decisão

1.  **Validade de 1 dia por token**, controlada por `expires_at` do próprio token (`SESSION_TOKEN_MINUTES`, padrão 1440; `config('sanctum.session_minutes')`). A expiração global do Sanctum (`sanctum.expiration`) fica desligada, porque ela se baseia em `created_at` e impediria renovar.
2.  **Renovação deslizante:** `POST /auth/refresh` (autenticado) estende o `expires_at` do token atual para agora + 1 dia e devolve `expires_in`. O token **não muda** (não há rotação). Login e cadastro também devolvem `expires_in`.
3.  **Sem requisição constante:** quem renova é o `frontend/proxy.ts`, **no máximo uma vez por hora** de uso. Um cookie `prisma_session_refreshed_at` (`httpOnly`) guarda o instante da última renovação; enquanto tiver menos de 1 hora, o proxy só repassa a requisição, sem chamar a API. Prefetch de links não renova. Se a renovação falhar por rede, a navegação segue normalmente e tenta de novo depois.
4.  **Cookie alinhado ao token:** a cada renovação o cookie `prisma_token` é regravado com validade de 1 dia (a duração vem de `expires_in`, sem número fixo no frontend).
5.  **Token vencido ou inválido:** a renovação responde 401, o proxy apaga os cookies e leva ao `/login`.
6.  **Migração:** tokens que já existiam (sem `expires_at`) recebem expiração agora + 1 dia (`set_expiry_on_existing_tokens`), para não ficarem eternos. Quem estava logado não precisa entrar de novo, e a primeira navegação renova o cookie.
7.  `sanctum:prune-expired --hours=24` está agendado (diário) para limpar tokens vencidos; só age onde o agendador do Laravel estiver rodando.

## Justificativa

-   O limite de 1 hora mantém o custo em no máximo uma chamada leve por hora de uso, e 1 dia de validade dá folga larga para essa renovação.
-   Usar o `expires_at` do token evita criar tokens novos a cada renovação (e tokens acumulados).
-   O cookie de marcação ao lado do token deixa o proxy decidir sem consultar o backend.

## Consequências

-   Quem ficar mais de 1 dia sem usar precisa entrar de novo; quem usa continuamente nunca é deslogado.
-   Um token vazado vale no máximo 1 dia após o último uso do dono (antes, até 30 dias).
-   A renovação acontece em navegação de página ou chamada de rota `/api/*` do Next, não em prefetch.
-   Duas abas podem renovar ao mesmo tempo; a operação é idempotente.
-   Continua sem lista de sessões e sem revogação de outros tokens ao fazer login.

## Alternativas consideradas

-   **Renovar a cada requisição:** simples, mas mandaria uma escrita ao banco em toda navegação.
-   **Rotacionar o token na renovação:** mais seguro contra vazamento, porém exige trocar o valor do cookie com concorrência entre requisições simultâneas; complexidade sem necessidade pelo escopo atual.
-   **Estender `sanctum.expiration`:** não renova, porque conta a partir da criação.

## Reconsiderar quando

Houver implantação em servidor com vários clientes (rotação de tokens, lista de sessões) ou necessidade de encerrar sessões à distância.
