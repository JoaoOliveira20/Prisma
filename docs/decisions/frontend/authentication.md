# Autenticação (login e cadastro)

**Situação:** implementada, com limitações. Decisão: [ADR-001](../adr/ADR-001-authentication-strategy.md). Lado do servidor: [backend/authentication.md](../backend/authentication.md).

## Objetivo

Entrada no sistema por e-mail e senha, criação de conta e manutenção da sessão. Cada conteúdo pertence a quem o criou (`../../IDEIA.md`).

## Interface

Uma única tela, `/login` (`app/(auth)/login/page.tsx`), em tema escuro, em duas colunas (empilhadas no mobile):

-   **Esquerda:** fundo `public/images/backgrounds/prism-beam.png` (cópia de `docs/assets/backgrounds/Prisma de Vidro e Arco-Íris Luminoso.png`) com um degradê escuro por cima para dar legibilidade, logotipo e a frase "Explore. Colecione. Descubra." em serifa.
-   **Direita:** `components/auth/AuthForm.tsx`, com abas **Entrar** / **Registrar** (acessíveis: `role="tablist"`).

Referência visual: tela "10 login cadastro" de `docs/assets/screens/PRISMA_telas_preview.png` (composição escura, painel de formulário à direita, abas Entrar/Registrar, botão claro). **Diferenças em relação à referência:** não há "Esqueceu a senha?" nem "Continuar com o Google" (não implementados). O enquadramento do prisma depende do tamanho da coluna (`bg-cover bg-center`) e **não foi conferido visualmente** em todas as larguras.

## Fluxo

1.  O formulário usa `useActionState` com as Server Actions `login`/`register` (`app/actions/auth.ts`).
2.  A action chama `POST /auth/login|register` pela função `apiRequest`. Em sucesso, grava o token no cookie `prisma_token` (`lib/session.ts`) e redireciona para `/`.
3.  Em erro, devolve `{ message, errors }`; o formulário mostra o erro de cada campo ou a mensagem geral (`role="alert"`). Falha de rede: "Não foi possível conectar ao servidor."
4.  Durante o envio o botão fica desabilitado ("Aguarde…"). O e-mail/nome digitados permanecem após um erro (`components/ui/Form.tsx`; só a senha deve ser redigitada se o usuário quiser).
5.  `logout` (botão "Sair" na sidebar) chama `POST /auth/logout`, apaga o cookie e vai para `/login`.

## Proteção de rotas

-   `proxy.ts` redireciona para `/login` qualquer rota (exceto `login`, `_next`, `images`) sem o cookie.
-   `app/(app)/layout.tsx` chama `getCurrentUser()` (`GET /auth/me`); se a API responder 401, `apiRequestOrLogin` redireciona para `/login`.
-   `/login` consulta `getOptionalUser()`; se o token for válido, redireciona para `/`. O proxy **não** redireciona a partir de `/login` justamente para não criar laço com um cookie inválido.

## Cookie

`prisma_token`: `httpOnly`, `SameSite=Lax`, `Secure` apenas em produção, `path=/`, 30 dias. Nunca é exposto a JavaScript do navegador.

## Validação e erros

Validação real no backend; no navegador só atributos HTML (`required`, `type="email"`, `autoComplete`). Mensagens de erro vêm do Laravel já em português (ver [api-structure.md](../backend/api-structure.md), seção "Idioma das mensagens").

## Limitações conhecidas

-   Sem recuperação de senha, verificação de e-mail ou login social.
-   Sem proteção contra tentativas além do `throttle` da API.
-   O cookie é conferido apenas por presença no proxy; um token revogado só é detectado na primeira chamada à API.

## Testes

Cobertos por `e2e/auth.spec.ts` (ver [testing.md](testing.md)).

## Arquivos

`app/(auth)/login/page.tsx`, `components/auth/AuthForm.tsx`, `app/actions/auth.ts`, `lib/session.ts`, `lib/api.ts`, `proxy.ts`, `components/ui/TextField.tsx`, `components/ui/Button.tsx`.
