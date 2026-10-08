# Estrutura da API

**Situação:** implementada. Base: `{API_URL}` = `/api`. Rotas em `backend/routes/api.php`.

## Convenções

-   **Limites de requisição** (`config/limits.php`): `login` e `register` por IP (`AUTH_RATE_LIMIT`, padrão 10/min; 429 com "Muitas tentativas…"); demais rotas por usuário (`API_RATE_LIMIT`, padrão 600/min, porque cada página do Next faz de 3 a 9 chamadas à API). Atenção: o Next faz as chamadas, então **todos os visitantes compartilham o IP do servidor Next** no limite de login; antes de implantar, encaminhe o IP real do cliente e configure proxies confiáveis.
-   JSON em tudo. Erros de validação: 422 `{ message, errors: { campo: [..] } }`. Não autenticado: 401. Sem permissão: 403. Inexistente: 404. Exclusão: 204.
-   Itens e listas vêm sob `data`. Listas paginadas (`paginate`) devolvem também `meta` (`current_page`, `last_page`, `total`…) e `links`: estilos, pessoas e estratégias em 24 por página; referências em 60. `?page=` escolhe a página e `?per_page=` (1 a 100) muda o tamanho; o frontend usa `per_page=100` nos seletores de vínculo (limite: acima de 100 itens esses seletores deixam de mostrar todos).
-   Estilos, pessoas e estratégias são endereçados por **slug** (único, gerado a partir do nome por `HasUniqueSlug`, com sufixo `-2`, `-3`… em colisões; o slug não muda quando o nome é editado). Grupos e referências por **id**.
-   Contratos de saída definidos em `app/Http/Resources/`; o frontend os espelha à mão em `frontend/types/api.ts`.
-   Entrada multipart: atualizações com arquivo usam `POST` + campo `_method=PUT`, porque o PHP não lê multipart em `PUT`.
-   Strings vazias viram `null` (middleware `ConvertEmptyStringsToNull`). Por isso o frontend envia `""` para limpar campos e um marcador vazio para limpar listas.

## Endpoints

Todos exigem autenticação, exceto os dois primeiros.

| Método e caminho | Função |
| --- | --- |
| `POST auth/register`, `POST auth/login` | Cadastro e login (limitados a 10/min) |
| `GET auth/me`, `POST auth/logout` | Usuário atual; encerrar |
| `GET/POST tags`, `PUT/DELETE tags/{slug}` | Tags com `usage_count` e `can`; filtro `q`. Excluir tag em uso devolve 409 |
| `GET/POST styles`, `GET/PUT/DELETE styles/{slug}` | Estilos. Filtros: `q` (nome, resumo, período, origem), `tag`, `sort=name\|recent` |
| `GET/POST people`, `GET/PUT/DELETE people/{slug}` | Pessoas (mesmos filtros; `q` também busca atuação) |
| `GET/POST strategies`, `GET/PUT/DELETE strategies/{slug}` | Estratégias (mesmos filtros; `q` também busca categoria) |
| `GET/POST references`, `GET/PUT/DELETE references/{id}` | Referências. Filtros: `q` (título, crédito), `type`+`slug` |
| `POST references/{id}/links`, `DELETE references/{id}/links/{type}/{slug}` | Vincula/desvincula **uma** entidade sem alterar as demais (exige ser dono da referência e da entidade) |
| `GET images` | Biblioteca unificada: referências + capas de estilos/estratégias + fotos de pessoas ([ADR-012](../adr/ADR-012-unified-image-library.md)). Filtros: `kind` (reference/style/person/strategy), `q`, `style` (slug), `mine=1`, `per_page` (48 por padrão, máx. 100). Resposta `{ data, meta }`; cada item tem `key`, `kind`, `slug`, `title`, `description`, `image_url`, `can` e, para referências, `links`, `is_favorite`, `group_ids` |
| `GET/POST groups`, `GET/PUT/DELETE groups/{id}` | Grupos; `GET groups/{id}` traz os itens por tipo |
| `POST groups/{id}/items`, `DELETE groups/{id}/items/{type}/{slug}` | Adicionar/remover item (`type` ∈ style, person, strategy, reference) |
| `POST/DELETE favorites/{type}/{slug}` | Atalho para o grupo Favoritos (`type` ∈ style, person, strategy, reference; para `reference`, `slug` é o id) |

Detalhes por recurso:

-   **Estilo:** `name` obrigatório; `summary`, `history`, `influences`, `characteristics[]`, `period`, `origin`, `cover_url`, `tags[]` (slugs existentes), `image` (arquivo), `remove_image`. `show` inclui tags, referências (com estado do usuário), pessoas e estratégias relacionadas, **`related`** (até 4 outros estilos que compartilham tags, ordenados pelo número de tags em comum) , `is_favorite` e `group_ids` do usuário.
-   **Pessoa:** `name`, `role`, `summary`, `biography`, `period`, `origin`, `photo_url`, `tags[]`, `styles[]` (slugs), imagem como acima.
-   **Estratégia:** `name`, `category`, `summary`, `description`, `cover_url`, `tags[]`, `styles[]`, imagem como acima.
-   **Referência:** criação exige `title` e (`image` arquivo **ou** `image_url`); `source_url`, `credit`, `description`, `links[]` (`{type, slug}`). Na edição a imagem não muda; `title`, `source_url`, `credit`, `description` e `links` sim (os vínculos são **substituídos**).
-   **Grupo:** `name` único por usuário.
-   Campos `is_favorite` (por usuário), `can` e `group_ids` dependem do usuário autenticado. Em referências, `group_ids` e `is_favorite` vêm em listas e no detalhe.
-   `cover_url`/`photo_url` na saída são a URL **exibível** (upload, se houver; senão a URL informada); `has_uploaded_image` indica upload.

## Busca

Todas as buscas `q` usam o escopo `matching` do trait `Searchable` (`app/Models/Concerns/Searchable.php`): `LIKE '%termo%' ESCAPE '!'`, com `!`, `%` e `_` escapados, então caracteres especiais são **literais** (digitar `%` não casa tudo). O escape `!` foi escolhido por funcionar igual em MySQL e SQLite. Sem índice de texto: é uma busca simples por substring.

## Estado do usuário dentro de itens aninhados

Os detalhes de estilo, pessoa e estratégia devolvem relacionados e referências **já com `is_favorite`** (e, nas referências, `group_ids` e `links`), para que corações e menus de grupo mostrem o estado correto também dentro de abas e do lightbox. Ao incluir um novo relacionado aninhado, carregue o estado do usuário (`withFavoriteFlag` / `withUserState`), senão ele aparece como "não favorito".

## Validação

Regras em `app/Http/Requests/`. Tags e estilos enviados precisam existir (`exists:tags,slug`): **tags não são criadas por texto livre**. URLs aceitam só `http` e `https`. Imagens: ver [armazenamento de imagens](image-storage.md).

## Idioma das mensagens

O locale é `pt_BR` (`APP_LOCALE`, padrão em `config/app.php`). As traduções ficam em `backend/lang/pt_BR/{auth,validation}.php` e `backend/lang/pt_BR.json`, **escritas à mão** ([ADR-009](../adr/ADR-009-handwritten-translations.md)); `validation.php` traz só as regras usadas hoje e os nomes de campos (`attributes`). Os handlers de `bootstrap/app.php` traduzem 401 ("Não autenticado.") e 403 ("Você não tem permissão para esta ação."), que o Laravel não traduz sozinho. **Ao usar uma regra de validação nova, acrescente a mensagem em `validation.php`** (e o nome do campo em `attributes`), senão o texto sai em inglês ou com a chave crua. Os testes rodam com `APP_LOCALE=pt_BR` (`phpunit.xml`).

## Limitações conhecidas

-   Mensagens de 404 e de erro 500 não foram traduzidas (em produção não expõem detalhes).
-   Sem ordenação por outros campos; busca é `LIKE` em nome e resumo (referências: título e crédito).
-   Sem versionamento da API.
