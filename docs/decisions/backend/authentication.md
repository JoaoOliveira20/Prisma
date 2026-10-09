# Autenticação (backend)

**Situação:** implementada, com limitações conhecidas. Decisão: [ADR-001](../adr/ADR-001-authentication-strategy.md). Lado do cliente: [frontend/authentication.md](../frontend/authentication.md).

## Fluxo

1.  `POST /api/auth/register` (nome, e-mail, senha, confirmação) cria o usuário e devolve `{ token, user }` com HTTP 201.
2.  `POST /api/auth/login` (e-mail, senha) valida com `Auth::validate`; se correto, devolve `{ token, user }`.
3.  As demais rotas ficam sob `auth:sanctum` e exigem `Authorization: Bearer <token>`.
4.  `GET /api/auth/me` devolve o usuário atual; `POST /api/auth/logout` apaga o token usado (204).

## Implementação

-   Controller: `app/Http/Controllers/Api/AuthController.php`. Requests: `RegisterRequest`, `LoginRequest`.
-   Modelo: `User` usa o trait `HasApiTokens`; a senha é guardada com cast `hashed`.
-   Cada login/cadastro cria um **novo token** chamado `web`. Logins repetidos acumulam tokens; só o token usado é apagado no logout.
-   O payload do usuário expõe apenas `name` e `email`.

## Validação e erros

-   Cadastro: nome obrigatório (até 120), e-mail válido e único, senha com mínimo de 8 caracteres e confirmação.
-   Login inválido devolve 422 com erro no campo `email` (mensagem genérica, sem revelar se o e-mail existe).
-   `login` e `register` usam o limitador `auth` (`AppServiceProvider`): por IP, `AUTH_RATE_LIMIT` por minuto (padrão 10). Resposta 429 com mensagem em português.
-   Mensagens em português: ver [api-structure.md](api-structure.md), seção "Idioma das mensagens".

## Limitações conhecidas

-   Tokens **expiram em 1 dia** (`expires_at` de cada token; `SESSION_TOKEN_MINUTES`, padrão 1440, em `config/sanctum.php`) e são **renovados pelo uso**: `POST /auth/refresh` estende o token atual para mais 1 dia e devolve `expires_in` ([ADR-020](../adr/ADR-020-sliding-session.md)). Login e cadastro também devolvem `expires_in`. A expiração global do Sanctum fica desligada. Sem escopos.
-   Sem verificação de e-mail, sem recuperação de senha, sem login social (o mockup `docs/assets/screens/PRISMA_telas_preview.png`, tela 10, mostra "Esqueceu a senha?" e "Continuar com o Google", ainda não implementados).
-   Tokens antigos não são revogados ao se criar um novo.
