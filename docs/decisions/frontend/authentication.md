# Autenticação (login e cadastro)

**Situação:** implementada, com limitações. Decisão: [ADR-001](../adr/ADR-001-authentication-strategy.md). Lado do servidor: [backend/authentication.md](../backend/authentication.md).

## Objetivo

Entrada no sistema por e-mail e senha, criação de conta e manutenção da sessão. Cada conteúdo pertence a quem o criou (`../../IDEIA.md`).

## Interface

Uma única tela, `/login` (`app/(auth)/login/page.tsx`), em tema escuro, pensada como **uma só composição** (não como duas imagens lado a lado). Redesenhada em 2026-10-08 depois de uma análise crítica da versão anterior (ver "Decisões").

**Arte (uma imagem só):** `public/images/backgrounds/prism-beam.png` (cópia de `docs/assets/backgrounds/Prisma de Vidro e Arco-Íris Luminoso.png`) cobrindo a tela. No desktop (≥ 1024 px) o prisma é posicionado no terço esquerdo, o feixe de luz **entra pela borda esquerda da tela** e o espectro sai para a direita e **se dissolve na escuridão antes da coluna do formulário**. Isso conduz o olhar da arte até o formulário e termina numa zona calma. A imagem **não** usa o segundo fundo (`prism-light-dark.png` deixou de aparecer no login; segue como fallback de capa).

**Zona calma do formulário:** uma camada (`.login-fade` em `app/globals.css`) cobre a região do formulário com `night` a 94%, ancorada na **largura real da coluna** (largura do formulário + margem + faixa de transição de 10 rem), então funciona em qualquer largura. Atrás dos campos nunca há luz forte nem espectro. Uma textura de granulação cinematográfica (`.film-grain`, ruído SVG a 7%, modo overlay) cobre a tela inteira de forma quase imperceptível. Os degradês aqui têm função (legibilidade e dissolução da imagem), não decorativa.

**Composição por faixa de largura** (classe `.login-art` e classes da página):

| Faixa | Composição |
| --- | --- |
| **≥ 1280 px** | prisma com largura `min(100vw, 140svh)`, centrado a 30% da largura e 40% da altura; frase de marca embaixo à esquerda; formulário à direita, centralizado verticalmente, com margem direita proporcional (`clamp(2rem, 7vw, 7rem)`) |
| **1024 a 1279 px** | prisma menor (`min(72vw, 140svh)`) centrado a 25%, para não encostar no formulário |
| **640 a 1023 px (tablet)** | **layout empilhado**: faixa de arte no topo (48% da altura da janela) com o prisma ancorado no topo, frase de marca logo abaixo da luz, formulário numa coluna central abaixo |
| **< 640 px (mobile)** | idem, com faixa de 44% e **sem** a frase de apoio, prisma menor ancorado no topo, para o botão "Entrar" ficar perto da dobra |
| **Janelas baixas (altura ≤ 760 px)** | espaçamentos verticais do formulário reduzidos para caber sem rolagem em 1280×720 |

A borda superior e inferior da imagem são suavizadas por máscara vertical (`mask-image`), senão a emenda aparecia como um retângulo mais claro.

**Hierarquia de leitura:** arte → logotipo PRISMA (grande, no topo do formulário) → título → campos → botão principal. A frase de marca ("Uma coisa → várias dimensões.", serifa grande, e a frase de apoio) fica embaixo à esquerda como mensagem secundária.

**Formulário** (`components/auth/AuthForm.tsx`, sem cartão: assenta direto sobre a zona calma, largura `max-w-sm`):

-   Logotipo PRISMA (`Logo` com `large`), título em serifa que muda com o modo ("Bem-vindo de volta" / "Crie sua conta") e frase de apoio. O título é o `h1` da página.
-   **Abas Entrar | Registrar** em texto com sublinhado (`role="tablist"`, alvo de 44 px).
-   Campos de 48 px de altura (`TextField` tom `night`): rótulo visível acima (`text-sm`), borda `night-muted` a 60% (**3,1:1** sobre o fundo do campo), fundo `night-surface`, cantos retos de 2 px (`rounded-sm`), borda mais clara no hover e no foco. Senha com botão **Mostrar/Ocultar** (alterna `type`, `aria-pressed`, `aria-controls`; no cadastro também afeta "Confirmar senha").
-   **"Esqueceu a senha? · em breve"** (desabilitado) logo abaixo da senha, só no modo entrar.
-   Botão principal "Entrar" / "Criar conta": 48 px, cor `night-text` (claro) com texto escuro, contraste 16,8:1.
-   Separador "ou" e botão **"Continuar com Google"** (desabilitado, com selo "em breve").
-   Linha final **"Ainda não tem conta? Criar conta"** / "Já tem uma conta? Entrar", que alterna o modo (segundo caminho claro para o cadastro, além da aba).
-   Erro geral numa faixa `night-danger` com borda e fundo suaves (`role="alert"`); erro de campo abaixo do campo, ligado por `aria-describedby`/`aria-invalid`. Carregando: botão desabilitado com "Aguarde…" e `aria-busy` no formulário.
-   **Foco de teclado:** a classe `night-scope` na página redefine `--color-focus-ring` como o off-white `night-text` (16:1), em vez do azul global, para combinar com a marca e manter contraste.
-   **Movimento:** o formulário entra com um leve "subir e aparecer" de 600 ms (`.rise-in`); `prefers-reduced-motion` o reduz a ~0 ms.

**Itens ainda não implementados, mostrados como indisponíveis de propósito:** "Esqueceu a senha?" e "Continuar com Google" existem no mockup e foram pedidos no desenho, mas **não têm backend**. Em vez de botões que não fazem nada, ficam desabilitados e rotulados "em breve", para o usuário não achar que a tela está quebrada. Quando forem implementados, troque o `disabled` por ação real e remova o selo.

Referência visual: tela "10 login cadastro" de `docs/assets/screens/PRISMA_telas_preview.png` (composição escura, prisma, formulário à direita, abas Entrar/Registrar, botão claro).

### Decisões do redesenho (2026-10-08)

-   **Uma única imagem em tela cheia** no lugar de duas colunas com imagens diferentes: o problema da versão anterior era a emenda dura entre dois mundos visuais; a luz que atravessa a tela e se dissolve resolve a continuidade e ainda direciona o olhar. *Alternativas avaliadas:* prisma à direita com formulário à esquerda (o feixe branco cruzaria o formulário, atrapalhando a leitura) e faixa cinematográfica no topo com formulário centralizado (boa no mobile, mas desperdiça altura no desktop e tira o protagonismo do formulário); foram descartadas.
-   **Sem cartão de vidro** (a primeira versão do dia usava um): o vidro dependia de haver luz atrás do formulário, o oposto do que a legibilidade pede; a zona calma sólida entrega leitura garantida.
-   **Prisma dimensionado pela largura *e* pela altura da janela** (`min(100vw, 140svh)`): dimensionar só pela largura fazia o prisma bater na frase de marca em telas baixas.
-   **Desvanecimento ancorado na coluna do formulário**, não em porcentagens da tela: porcentagens deixavam o espectro encostar nos campos em 1024 px.
-   **Contrastes verificados:** texto principal 15,5:1 sobre o campo; texto secundário (`night-muted`) 7,0:1 sobre o fundo e 6,5:1 sobre o campo; borda de campo 3,1:1; botão 16,8:1. Itens desabilitados ("esqueceu a senha", Google) estão isentos, mas mantêm 6:1 de leitura em "em breve".

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

-   Sem recuperação de senha, verificação de e-mail ou login social (os dois primeiros itens da tela estão desabilitados e rotulados "em breve").
-   A arte depende de números calculados para a posição do prisma (`.login-art`: fração 0,466 de largura e 0,41 de altura da imagem). **Se a imagem `prism-beam.png` for trocada, esses valores precisam ser recalculados**, senão o prisma sai do lugar e o feixe/espectro podem atravessar o formulário.
-   Conferido visualmente em 1920×1080, 1440×900, 1280×720, 1024×768, 768×1024 e 390×844; larguras muito fora disso (ultralargas, janelas muito estreitas em desktop) não foram verificadas.
-   O teste de movimento reduzido só confirma que o formulário fica visível; não valida a aparência da arte.
-   Sem proteção contra tentativas além do `throttle` da API.
-   O cookie é conferido apenas por presença no proxy; um token revogado só é detectado na primeira chamada à API.

## Testes

Cobertos por `e2e/auth.spec.ts` e `e2e/responsive.spec.ts` (ver [testing.md](testing.md)): título principal, mostrar senha, alternância pelo rodapé, itens indisponíveis, anel e ordem de foco, movimento reduzido, e mobile/tablet sem rolagem horizontal com botão de 44 px ou mais.

## Arquivos

`app/(auth)/login/page.tsx`, `components/auth/AuthForm.tsx`, `app/actions/auth.ts`, `lib/session.ts`, `lib/api.ts`, `proxy.ts`, `components/ui/TextField.tsx`, `components/ui/Button.tsx`, `components/brand/Logo.tsx`, `app/globals.css` (`.login-art`, `.login-fade`, `.film-grain`, `.night-scope`, `.rise-in`).
