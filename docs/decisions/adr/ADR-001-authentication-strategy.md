# ADR-001: Autenticação por token Sanctum em cookie `httpOnly`

-   **Data:** 2026-10-08
-   **Status:** aceita

## Contexto

`../../IDEIA.md` exige autenticação na primeira versão, com cada conteúdo pertencendo a um usuário. A stack é Laravel (API) + Next.js (interface), em origens diferentes (`:8000` e `:3000` em desenvolvimento).

## Decisão

-   O Laravel emite **tokens pessoais do Sanctum** em `POST /api/auth/login` e `/register`.
-   O Next.js guarda o token no cookie **`prisma_token`**, `httpOnly`, `SameSite=Lax`, `Secure` em produção, validade de 30 dias.
-   O token é usado somente por código de servidor do Next.js (ver ADR-003); o navegador nunca o lê.
-   `frontend/proxy.ts` bloqueia rotas autenticadas quando o cookie não existe; a validade real é conferida pela API a cada requisição.

## Justificativa

-   Cookie `httpOnly` impede que JavaScript (inclusive via XSS) leia o token.
-   Tokens evitam a configuração de autenticação de SPA do Sanctum (cookies de sessão entre domínios, CSRF, domínios stateful), que seria necessária se o navegador falasse com o Laravel.
-   Tokens deixam a API utilizável por outros clientes no futuro.

## Consequências

-   Logout apaga o token no servidor (`currentAccessToken()->delete()`) e o cookie.
-   Os tokens **expiram em 30 dias** no servidor (`SANCTUM_EXPIRATION`, padrão 43200 minutos), igual ao cookie; depois disso é preciso entrar de novo (sem renovação). Um token vazado vale até expirar ou até o logout.
-   O limite de tentativas de login é por IP e, como o Next faz as chamadas, o IP visto pela API é o do servidor Next: antes de implantar, o IP real do cliente precisa ser encaminhado.
-   Não existem escopos/abilities: todo token acessa toda a API do usuário.
-   O proxy só confere a presença do cookie, então um cookie inválido só é detectado na primeira chamada à API (que redireciona para `/login`).

## Alternativas consideradas

-   **Sanctum em modo SPA (sessão/cookie)**: descartada pela complexidade de domínios e CSRF entre `localhost:3000` e `:8000`. Não foi discutida com o responsável.
-   **Token em `localStorage` e chamadas diretas do navegador**: descartada por expor o token a XSS.

## Quando reconsiderar

Ao implantar em servidor: avaliar rotação de tokens, encaminhamento do IP do cliente e, se houver múltiplos clientes, escopos. (A expiração de 30 dias foi adicionada em 2026-10-08, sem alterar a decisão.)

## Referências

-   [Autenticação no backend](../backend/authentication.md), [no frontend](../frontend/authentication.md)
-   `backend/app/Http/Controllers/Api/AuthController.php`, `frontend/lib/session.ts`, `frontend/proxy.ts`
