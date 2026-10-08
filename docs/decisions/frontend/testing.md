# Testes automatizados do frontend (E2E)

**Situação:** implementada. Decisão: [ADR-011](../adr/ADR-011-playwright-e2e.md).

## O que existe

Testes **ponta a ponta** com Playwright em `frontend/e2e/`, executados contra a pilha real (Next.js + API Laravel + MySQL). Não há testes unitários nem de componentes isolados.

| Arquivo | Cobre |
| --- | --- |
| `auth.spec.ts` | rota protegida, erro de login em português (campo preservado), validação de cadastro, e-mail duplicado, sessão persistente e logout, `/login` quando já logado, cookie inválido sem laço de redirecionamento, cabeçalhos de segurança |
| `content.spec.ts` | criar, favoritar, salvar em grupo (menu "⋯" e modal), editar e excluir estilo (modal de confirmação, inclusive cancelar); conteúdo de outro usuário sem Editar/Excluir; vínculos pessoa/estratégia ↔ estilo; busca e filtro por tag; erro de validação **preserva o digitado**; coração em itens relacionados e no lightbox; paginação (página 2 e redirecionamento para a última) |
| `tags-search.spec.ts` | tags (criar, duplicar, renomear, somente leitura, em uso não exclui, exclusão), pesquisa global (grupos por tipo, teclado, vazio, `%` literal) |
| `references.spec.ts` | modais de referência (criar com upload e vínculo, editar, favoritar, salvar em grupo, remover com confirmação); imagem obrigatória e arquivo inválido com o digitado preservado; vincular a mesma imagem a dois estilos; filtros da biblioteca (origem, estilo, só o que criei); lightbox de capa leva ao conteúdo; capa enviada e removida |
| `explore.spec.ts` | Explorar em seções por tipo (diferente de Estilos), busca e filtro por tag |
| `responsive.spec.ts` | menu mobile (abrir, navegar, `Esc`), ausência de rolagem horizontal em 390 px |

Helpers em `e2e/helpers.ts` (`register`, `loginAsDemo`, `createApiSession`); imagem de teste em `e2e/fixtures/pixel.png`. Cada teste cria seu próprio usuário (`register`) e dados com nomes únicos; os dados de teste **não são removidos** (rode `migrate:fresh --seed` para limpar).

## Como executar

1.  Backend no ar (`kool start`) e `AUTH_RATE_LIMIT` alto no `backend/.env` (ex.: `AUTH_RATE_LIMIT=1000`), porque os testes fazem dezenas de logins/cadastros do mesmo IP e o limite padrão é 10 por minuto. Depois de mudar o `.env`: `kool run artisan config:clear`.
2.  Banco com os dados de demonstração: `kool run artisan migrate:fresh --seed`.
3.  Frontend no ar: `yarn dev` (porta 3000).
4.  Primeira vez: `yarn playwright install chromium`.
5.  `yarn e2e` (ou `yarn playwright test e2e/auth.spec.ts`).

Variáveis opcionais: `E2E_BASE_URL` e `E2E_API_URL`.

### WSL / Linux sem bibliotecas do Chromium

Se o navegador não abrir com `libnspr4.so: cannot open shared object file`, instale `libnss3`, `libnspr4` e `libasound2t64` (`sudo apt install …` ou `yarn playwright install-deps`). Sem `sudo`, dá para baixar os `.deb` com `apt-get download`, extrair com `dpkg -x` numa pasta local e apontar `LD_LIBRARY_PATH` para ela ao rodar os testes.

## Armadilhas aprendidas

-   O Playwright injeta `caret-color: transparent` ao tirar screenshots; isso aparece como aviso de hidratação do React em desenvolvimento, **não é bug do app**.
-   Aguarde `networkidle` antes de usar atalhos de teclado: o `Ctrl+K` só funciona depois da hidratação.
-   A senha do usuário demo (`password`) é de desenvolvimento.

## Limitações

-   Os testes **acumulam dados** no banco (estilos, tags, referências), o que muda contagens e a paginação das listas; por isso as asserções usam nomes únicos e buscas por texto, nunca contagens fixas. Recomenda-se `migrate:fresh --seed` antes de cada rodada.
-   Os testes dependem de dados do seeder (estilo "Bauhaus", pessoa "Dieter Rams", tag "Arquitetura"); mudar o seeder pode quebrá-los.
-   Rodam só em Chromium; não há integração contínua configurada.
-   Não cobrem acessibilidade automatizada (axe) nem regressão visual.
