# Integração frontend ↔ backend

**Situação:** implementada. **Decisão registrada em:** [ADR-003](../adr/ADR-003-frontend-backend-integration.md), [ADR-001](../adr/ADR-001-authentication-strategy.md).

## Princípio

Toda chamada à API acontece **no servidor do Next.js**. O navegador nunca recebe o token da API nem conhece o endereço do Laravel.

## Caminhos de dados

| Necessidade | Mecanismo | Arquivo |
| --- | --- | --- |
| Ler dados para renderizar uma página | Server Component chama `lib/data.ts` | `frontend/lib/data.ts` |
| Criar, alterar, excluir | Server Action | `frontend/app/actions/*.ts` |
| Dados sob demanda no cliente (pesquisa global, opções de vínculo, referências do usuário) | Route Handlers do Next que repassam à API | `frontend/app/api/{search,link-options,my-references}/route.ts` |

Todos usam `apiRequest` (`frontend/lib/api.ts`), que lê o token do cookie `httpOnly`, envia `Authorization: Bearer`, desliga cache (`cache: "no-store"`) e converte erros em `ApiError` (status, mensagem, erros por campo).

## Configuração

-   `API_URL` (frontend): endereço base da API; padrão `http://localhost:8000/api`. Exemplo em `frontend/.env.example`.
-   Não há CORS a configurar, porque o navegador não chama o Laravel.
-   Uploads passam pelo Next: o limite de corpo das Server Actions está em `6mb` (`frontend/next.config.ts`), acima do limite de 5 MB da API para acomodar o overhead do multipart.

## Contrato de dados

-   Tipos TypeScript espelham os JSON Resources do Laravel em `frontend/types/api.ts`. **Não são gerados**: ao mudar um Resource, atualize o tipo manualmente.
-   Listas vêm como `{ data: [...], meta, links }` (24 por página; referências 60). O frontend pagina estilos, pessoas, estratégias e referências por `?page=`; seletores usam `per_page=100`.
-   Erros de validação: HTTP 422 com `{ message, errors: { campo: [mensagens] } }`. As Server Actions devolvem esse formato ao formulário via `FormState` (`frontend/lib/form.ts`).
-   Sessão expirada ou token inválido: 401 → `apiRequestOrLogin` redireciona para `/login`.

## Consequências

-   Mais seguro (token fora do alcance de JavaScript do navegador) e sem CORS.
-   Cada ação do usuário faz um salto extra (navegador → Next → Laravel).
-   Interações puramente de cliente (como a pesquisa) precisam de um Route Handler.
-   Uploads grandes passam duas vezes pela rede local do servidor.

## Quando reconsiderar

Se surgirem clientes além do Next (aplicativo móvel, por exemplo), a API já é utilizável diretamente com tokens Sanctum. Se o salto extra virar gargalo, considere chamadas diretas do navegador com CORS, reavaliando como o token seria guardado.
