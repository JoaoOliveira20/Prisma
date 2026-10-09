# Registro de tarefas

> Este arquivo é o quadro de acompanhamento do projeto. A IA deve
> atualizá-lo ao iniciar, concluir, bloquear ou redefinir tarefas. Não
> marque algo como concluído sem verificar o código ou o resultado
> correspondente.

## Como usar

-   `TODO`: ainda não iniciado.
-   `IN_PROGRESS`: em andamento.
-   `BLOCKED`: impedido por dependência ou decisão pendente.
-   `DONE`: implementado e verificado.
-   Divida tarefas grandes em etapas verificáveis.
-   Registre decisões importantes e bloqueios com contexto suficiente
    para retomar o trabalho.
-   Mantenha a lista realista; não marque tarefas futuras como
    concluídas por inferência.

## Fase 1 --- Estrutura e ambiente

-   [x] `DONE` Confirmar a estrutura de diretórios do projeto.
-   [x] `DONE` Configurar o projeto Laravel.
-   [x] `DONE` Configurar o projeto Next.js com TypeScript e Tailwind
    CSS.
-   [x] `DONE` Configurar MySQL e variáveis de ambiente.
-   [x] `DONE` Criar e revisar arquivos `.env.example`.
-   [x] `DONE` Confirmar comandos de desenvolvimento, lint, tipos e
    testes.

## Fase 2 --- Base de dados e autenticação

-   [x] `DONE` Definir o fluxo de autenticação da aplicação.
-   [x] `DONE` Implementar autenticação.
-   [x] `DONE` Criar migrations iniciais.
-   [x] `DONE` Criar models e relacionamentos necessários.
-   [x] `DONE` Implementar autorização por proprietário.
-   [x] `DONE` Criar seeders com um conjunto pequeno de estilos.

## Fase 3 --- API

-   [x] `DONE` Definir contratos iniciais da API.
-   [x] `DONE` Implementar endpoints para estilos.
-   [x] `DONE` Implementar endpoints para pessoas.
-   [x] `DONE` Implementar endpoints para estratégias.
-   [x] `DONE` Implementar gestão de referências e uploads.
-   [x] `DONE` Implementar tags controladas.
-   [x] `DONE` Implementar favoritos.
-   [x] `DONE` Implementar grupos.
-   [ ] `TODO` Testar validação, erros e autorização.

## Fase 4 --- Fundamentos de interface

-   [x] `DONE` Definir tokens básicos do design system.
-   [x] `DONE` Criar layout principal e sidebar.
-   [x] `DONE` Criar padrões de cards e estados de interface.
-   [x] `DONE` Integrar o frontend com a API.
-   [x] `DONE` Implementar tela inicial de descoberta.
-   [x] `DONE` Implementar páginas de detalhes.
-   [x] `DONE` Implementar formulários de criação e edição.
-   [x] `DONE` Implementar galeria e Lightbox.

## Fase 5 --- Exploração e organização

-   [x] `DONE` Implementar pesquisa global / Command Palette.
-   [ ] `TODO` Implementar filtros.
-   [x] `DONE` Implementar favoritos.
-   [x] `DONE` Implementar grupos.
-   [x] `DONE` Implementar navegação entre conteúdos relacionados.
-   [ ] `TODO` Revisar acessibilidade e responsividade.

## Fase 6 --- Validação

-   [ ] `TODO` Fazer uma revisão geral de segurança e propriedade dos
    dados.
-   [ ] `TODO` Executar lint, verificação de tipos e testes disponíveis.
-   [ ] `TODO` Corrigir problemas encontrados.
-   [ ] `TODO` Revisar documentação de instalação e execução local.
-   [ ] `TODO` Confirmar os critérios da primeira versão com o documento
    de ideia original.

## Trabalho em andamento

Nenhuma tarefa registrada como em andamento.

## Bloqueios e decisões pendentes

Nenhum bloqueio registrado. Adicione aqui somente bloqueios reais e
decisões que estejam impedindo o trabalho.

## Histórico de conclusão

Registre tarefas concluídas relevantes com data, resultado verificado e,
quando útil, arquivos afetados.

-   2026-10-08: ambiente Kool (MySQL) + Laravel 13 + Sanctum; API de estilos, tags, favoritos e referências por URL (12 testes PHPUnit passando); frontend Next.js com login/registro, sidebar, início, explorar, estilos, favoritos, detalhe com galeria/lightbox, criação/edição e pesquisa global (Ctrl/Cmd+K) para estilos.

-   2026-10-08: pessoas e estratégias (API, seeders, páginas, formulários, relação com estilos); favoritos substituídos por grupos (grupo padrão "Favoritos" + grupos personalizados, menu "Salvar em grupo"); pesquisa global cobre os três tipos. 21 testes PHPUnit passando; lint, tipos e build do frontend limpos.

-   2026-10-08: referências polimórficas (estilo, pessoa, estratégia) com envio de arquivo (Laravel Storage, disco público, até 5 MB, SVG rejeitado) ou URL; biblioteca `/referencias`, nova referência com vínculos e aba Referências nas três páginas de detalhe. 25 testes PHPUnit passando; upload verificado contra a API real.

-   2026-10-08: upload de imagem em capa de estilo/estratégia e foto de pessoa (com remover); edição de referências (título, crédito, fonte e vínculos); exclusão de conteúdo remove vínculos e itens de grupo (bug de evento `deleting` corrigido, com teste); 31 testes PHPUnit passando.
-   2026-10-08: documentação permanente em `docs/decisions/` (índice, arquitetura, backend, frontend, infraestrutura e 8 ADRs) e regras de manutenção no `CLAUDE.md`.

-   2026-10-08: mensagens da API em pt_BR (lang à mão, handlers 401/403, ADR-009); paginação por `?page=` em estilos, pessoas, estratégias e referências; referências favoritáveis e agrupáveis (tipo `reference`); login com `prism-beam.png`. 34 testes PHPUnit; lint, tipos e build do frontend limpos.

-   2026-10-08: **fechamento do escopo inicial**: gestão de tags (ADR-010); busca nas listagens (nome, resumo, período, origem, atuação, categoria) e ordenação; pesquisa global em 6 tipos; conteúdo de demonstração com arte SVG original; expiração de token (30 dias), limitadores de requisição, busca com curingas escapados, cabeçalhos de segurança; 24 testes E2E (Playwright, ADR-011) e 47 PHPUnit; revisão visual por capturas reais; correções: formulários preservam o digitado após erro, corações de itens aninhados, lock do grupo Favoritos, redirecionamento de página inexistente.

-   2026-10-08: **ajustes de interface pedidos pelo responsável**: Explorar virou tela de descoberta (seções por tipo) distinta de Estilos; menu "⋯" nos detalhes (Salvar em grupo, Editar, Excluir); modais para adicionar/editar referência, salvar em grupo e confirmar exclusões (sem `confirm()` do navegador); biblioteca `/referencias` unificada (referências + capas + fotos) com descrição e filtros (origem, estilo, só o que criei, busca); vincular uma imagem a vários estilos (modal "Vincular imagem existente" e endpoints de vínculo); ADR-012. 53 testes PHPUnit e 29 E2E passando.

-   2026-10-08: **paleta de pesquisa redesenhada** a partir de exemplo da Motion, sem a biblioteca: comandos de navegação e criação, filtro sem acento, destaque deslizante, setas em ciclo, rodapé de atalhos, animação de entrada/saída, ARIA completo; `/referencias?nova=1` abre o modal. Bugs achados e corrigidos: destaque ausente na primeira abertura, reabrir durante a animação de saída. 34 testes E2E.

-   2026-10-08: **login em card de vidro fosco**: o formulário passou a um card translúcido com desfoque sobre o fundo `prism-light-dark.png`, abas em pílula, campos e botão mais refinados; a composição de duas colunas e o fluxo não mudaram. 34 testes E2E passando.

-   2026-10-08: **login redesenhado como uma composição única** (análise crítica, 3 direções avaliadas, escolhida "feixe que atravessa e se dissolve"): arte única em tela cheia com zona calma para o formulário, formulário sem cartão com mostrar senha, separador "ou", "Esqueceu a senha?" e Google (ambos desabilitados, "em breve"), alternância pelo rodapé, foco claro e composição própria para tablet e mobile. Substitui o card de vidro. 40 testes E2E passando.

-   2026-10-08: **redesenho completo da interface** (ADR-013), de forma autônoma: auditoria das 13 telas e do fluxo, direção "arquivo editorial" (tokens novos, serifa em escala grande, filetes, cantos retos, filete espectral), sidebar em índice com busca no topo e barra superior abaixo de 1024 px, Início como entrada do arquivo, Explorar como descoberta por seções, composição própria por tipo (ritmo em estilos, retratos em pessoas, lista tipográfica em estratégias, mosaico em referências e coleções, índice tipográfico em tags), detalhes como páginas contínuas de dimensões com índice fixo e estilos relacionados, formulários em duas colunas com pré-visualização, coleções com mosaico e `/favoritos`, lightbox com navegação, link "pular para o conteúdo". Backend: `related` em estilos e `previews` em grupos, limites de requisição configuráveis (`config/limits.php`), cache em arquivo. Bugs achados e corrigidos: ids duplicados de gradiente que apagavam o logotipo, estouro horizontal com nomes longos, limite de API apertado, deadlock raro no cache MySQL, indicador de desenvolvimento cobrindo "Sair". Verificação: 56 testes PHPUnit, 54 E2E (inclui axe sem violações WCAG AA).

-   2026-10-08: **arquitetura de dimensões e motion** (ADR-014): História, Características e Influências viraram uma seção "Sobre o estilo"; Pessoas, Estratégias e Referências do estilo (e Referências de pessoa e estratégia) mostram só uma prévia (6/5/8) com "Ver as N …" para listas filtradas (`/pessoas?style=`, `/estrategias?style=`, `/referencias?style|person|strategy=`) com faixa de contexto; a API devolve prévias e contagens. Camada de movimento sem biblioteca: entrada de página, reaparecimento de resultados, revelação por rolagem (`animation-timeline`), fade de imagens, diálogos com saída, menus, resultados da paleta, sublinhado que se desenha, índice com traço deslizante, coração com "pulo", sidebar viva (indicador, hover, minimizar, painel mobile) e `prefers-reduced-motion`. 59 testes PHPUnit e 55 E2E (axe sem violações, com movimento reduzido na verificação). Ajuste de teste: favoritar agora espera a gravação antes de navegar (corrida antiga).

-   2026-10-08: **referências com página própria** a pedido do responsável: `/estilos|pessoas|estrategias/[slug]/referencias` mostram só as imagens do conteúdo (trilha, busca, adicionar, paginação), sem o "Sobre"; "Ver todas as N referências" e o item "Referências →" do índice levam até lá. Teste E2E atualizado; um teste da biblioteca passou a buscar por texto (não depende mais da página 1 com dados acumulados).

-   2026-10-08: **cartões da biblioteca com tags principais**: cada imagem virou um cartão (nomes vinculados, título, descrição e até 3 tags derivadas do conteúdo vinculado; lightbox também). Sem nova tabela: referências continuam sem tags próprias. 60 testes PHPUnit; E2E de referências, conteúdo e acessibilidade passando.

-   2026-10-08: **tags próprias nas imagens e vínculo mais ágil** (ADR-015): pivô `reference_item_tag` (migration nova), tags no formulário e no lightbox, filtro por tag na biblioteca (referências e capas/fotos), tags clicáveis nos cartões; `EntityPicker` com busca no lugar das listas de até 100, busca no painel de imagem existente, seleção em lote (`POST /references/links`) e "Vincular a…" no lightbox. Não feito (propostos): sugestão de vínculo por tags em comum e destaque/ordem das imagens na prévia do estilo.

-   2026-10-08: **biblioteca de referências redesenhada como arquivo visual** (ADR-016): imagem no lugar do cartão (legenda de uma linha; tags, favoritar e salvar em grupo no hover/foco), "Última adição" em destaque, busca ao vivo (inclui tags, vínculos e fonte), painel de filtros (estilo, pessoa, estratégia, tag, coleção, só o meu) com chips, ordenação, contexto "Filtrando por …", estados vazio e sem resultados, página própria da referência com "Faz parte de" e "Mais como esta", mobile com 2 colunas e filtros em painel. Backend: `group`, `sort`, busca ampliada em `/images`; `related` e `created_at` em `/references/{id}`. 68 testes PHPUnit. Limitações: imagens sem miniaturas, seletores de filtro limitados a 100 itens.

-   2026-10-08: **sidebar revisada** (ADR-017): três blocos (entrada, Dimensões com Tags, Minha coleção), item ativo em serifa com filete na borda e estado de seção de origem, minimizar persistente em cookie com dicas e chevron, logo como link, atalho ⌘/Ctrl, conta com avatar, ícone de Estratégias trocado, mobile em índice com foco, `inert` e bloqueio de rolagem. Sem Perfil/Configurações (não existem). Testes E2E novos para blocos, seção de origem, persistência do minimizar e foco do menu mobile.

-   2026-10-09: **cada conta é um acervo privado** (ADR-018): estilos, pessoas, estratégias, referências, tags e grupos só aparecem para o dono (global scope `OwnedByUser`, 404 para registro alheio, slugs e nomes únicos por conta, validações por conta, consultas de `/images` filtradas); seeders criam tudo na conta demo; conta nova começa vazia com estados orientadores; Explorar mostra tudo **da conta**; removido o filtro "só o que eu criei". Migration `scope_content_to_owner` (índices por conta; tags sem dono foram para a conta demo). 75 testes PHPUnit (`DataIsolationApiTest` novo) e E2E reescritos (demo onde precisa do acervo, contas novas onde não precisa).

-   2026-10-09: **migrations reorganizadas** (ADR-019): uma por tabela (separadas `reference_items`/`referenceables`, `groups`/`group_items` e os quatro vínculos de conteúdo; `reference_item_tag` com nome de arquivo coerente), vínculos em ordem sequencial, `down()` da `scope_content_to_owner` corrigido para MySQL. Esquema comparado com o banco atual (idêntico, 23 tabelas), rollback e nova instalação testados em banco temporário, `migrations` do banco de desenvolvimento atualizada sem perder dados. Em seguida, migration nova `make_tags_user_required` (`tags.user_id` obrigatório com cascata), testada em `up`/`down` no MySQL e com teste de exclusão do usuário. 76 testes PHPUnit.

## Pendências conhecidas da primeira entrega

-   Imagem de referência não pode ser trocada depois de criada; estilos/pessoas sem imagem não aparecem na biblioteca; capas e fotos não viram referência.
-   Seeders não incluem imagens: estilos, pessoas e estratégias demo usam o fallback visual até receberem imagem (agora é possível enviar arquivo).
-   Seletores de vínculo limitados a 100 itens; mensagens de 404/500 da API não traduzidas.
-   Testes E2E rodam manualmente (sem integração contínua) e dependem dos dados do seeder.
-   Sem retratos reais de pessoas (placas tipográficas); capas de demonstração são arte original em SVG. Muitas placas iguais enfraquecem a lista de pessoas.
-   `GUIA-DE-DESIGN.md` (fora do repositório, anterior ao redesenho) está desatualizado; a referência vigente é `docs/decisions/frontend/design-system.md`.
-   Sem página própria por tag nem mesclagem de tags; sem filtros estruturados de período/origem (a busca de texto cobre).
-   Sem Content-Security-Policy; limite de login por IP exige encaminhar o IP real em produção.
-   Recuperação de senha, login social e verificação de e-mail não implementados.
