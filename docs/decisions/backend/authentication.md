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

-   Tokens **expiram em 30 dias** no servidor (`config/sanctum.php`, `SANCTUM_EXPIRATION` em minutos, padrão 43200), alinhado ao cookie do frontend; sem escopos e sem renovação (depois de 30 dias é preciso entrar de novo).
-   Sem verificação de e-mail, sem recuperação de senha, sem login social (o mockup `docs/assets/screens/PRISMA_telas_preview.png`, tela 10, mostra "Esqueceu a senha?" e "Continuar com o Google", ainda não implementados).
-   Tokens antigos não são revogados ao se criar um novo.
