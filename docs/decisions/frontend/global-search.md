# Pesquisa global (Command Palette)

**Situação:** implementada para estilos, pessoas, estratégias, referências, grupos e tags.

## Funcionamento

-   Aberta por **Ctrl+K / Cmd+K** em qualquer tela autenticada ou pelo campo de busca do cabeçalho (`components/search/SearchTrigger.tsx`, que dispara o evento `prisma:open-search`).
-   `components/search/CommandPalette.tsx` (montado em `app/(app)/layout.tsx`) usa `<dialog>` modal. A cada digitação, com **debounce de 200 ms** e cancelamento da requisição anterior, chama `GET /api/search?q=` (Route Handler do Next, `app/api/search/route.ts`).
-   O Route Handler consulta `/styles`, `/people`, `/strategies`, `/references`, `/groups` e `/tags` da API em paralelo (`q`) e devolve até **5 itens por tipo**, agrupados com rótulo, já com `href`, nome, subtítulo e imagem. Destinos: estilos/pessoas/estratégias → página de detalhe; **referências** → `/referencias?q=<título>` (não há página por referência); **grupos** → `/grupos/<id>`; **tags** → `/explorar?tag=<slug>`.
-   Navegação por teclado: setas movem a seleção, Enter abre, Esc fecha; mouse também funciona.
-   Estados: vazio ("Digite para pesquisar"), carregando, sem resultados e erro.

## Decisões

-   **Route Handler em vez de chamada direta:** o token fica no cookie `httpOnly` e só o servidor do Next pode usá-lo ([ADR-003](../adr/ADR-003-frontend-backend-integration.md)).
-   A busca é o `LIKE` da API (nome e resumo); não há busca textual avançada nem tolerância a erros de digitação.

## Limitações

-   Seis chamadas à API por pesquisa (em paralelo).
-   Tags levam só à listagem de estilos; referências abrem a biblioteca filtrada, não o item.
-   O padrão ARIA do combobox está simplificado (sem `aria-activedescendant`).

## Referência visual

Tela "09 busca global" do mockup (campo no topo, resultados por categoria). Apresentada aqui como diálogo flutuante, não como tela cheia.
