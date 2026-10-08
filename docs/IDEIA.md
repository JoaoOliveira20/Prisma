# Hub de Referência Estética, Artística e Conceitual

> Documento-base do conceito original. Este arquivo registra o propósito
> e as decisões fundamentais do projeto; mudanças de implementação devem
> ser documentadas nos arquivos técnicos correspondentes.

## Visão geral

O projeto é um sistema pessoal para organizar, explorar e relacionar
referências de estilos visuais, estéticas, movimentos artísticos,
designers, artistas, teóricos, estratégias, práticas, manifestos,
regras, referências visuais e conceitos.

A proposta é funcionar como uma **enciclopédia visual pessoal**: um
lugar para estudar, consultar, relacionar e expandir uma base de
conhecimento visual.

A primeira versão será executada localmente, mas a arquitetura deve
permitir uma futura implantação em VPS, minisservidor ou servidor
remoto, com acesso por diferentes dispositivos.

## Objetivos centrais

-   Descobrir e pesquisar referências.
-   Organizar informações e referências visuais.
-   Relacionar estilos, pessoas, estratégias e obras.
-   Consultar conteúdos rapidamente.
-   Construir uma base de conhecimento própria que evolui com o uso.

## Tipos de conteúdo

-   **Styles:** estilos, estéticas e movimentos.
-   **People:** designers, artistas, teóricos, arquitetos e outros
    criadores.
-   **Strategies:** práticas, regras, princípios, manifestos e
    metodologias.
-   **References:** imagens, obras, produtos, interfaces, links e
    observações.
-   **Tags:** vocabulário controlado para classificar conteúdos.
-   **Favorites:** conteúdos salvos por cada usuário.
-   **Groups:** coleções pessoais criadas pelo usuário.

## Experiência do produto

A navegação principal será feita por uma sidebar lateral, que poderá ser
expandida ou minimizada. A pesquisa global poderá ser aberta pelo campo
de busca ou pelos atalhos `Ctrl + K` e `Cmd + K`, apresentando
resultados de diferentes tipos de conteúdo agrupados por categoria.

A tela inicial será uma área de descoberta, com pesquisa, filtros e
cards visuais. Os cards podem apresentar imagem principal, nome,
descrição curta, tags, período e controle de favorito.

Cada entidade terá uma página própria, organizada em seções. A página de
um estilo, por exemplo, poderá apresentar história, características,
influências, referências, pessoas relacionadas e tags. As referências
deverão formar uma biblioteca visual, não apenas uma única imagem de
capa.

## Conteúdo e relações

Uma referência pode se relacionar com mais de um estilo, pessoa ou
estratégia. O sistema não deve forçar classificações únicas quando uma
obra ou ideia tiver múltiplas influências.

As páginas não precisam estar completas no momento da criação. A base é
viva: cada entidade pode começar com poucos dados e receber novas
seções, referências, links, imagens e observações ao longo do tempo.

## Usuários e propriedade

A autenticação faz parte da primeira versão. Cada conteúdo criado
pertence ao usuário que o criou, e somente seu proprietário pode
editá-lo. O modelo deverá permitir futuras possibilidades de
compartilhamento e publicação, sem exigir que essas funcionalidades
sejam implementadas agora.

## Funcionalidades previstas para a primeira versão

-   Criar conta e entrar no sistema.
-   Visualizar e abrir estilos.
-   Consultar história, características, influências e referências.
-   Consultar pessoas e estratégias relacionadas.
-   Criar e editar conteúdo próprio.
-   Adicionar referências por URL ou upload.
-   Favoritar estilos, pessoas e estratégias.
-   Pesquisar globalmente.
-   Utilizar tags controladas.
-   Criar grupos pessoais.
-   Navegar entre conteúdos relacionados.

## Conteúdo inicial

Começar com aproximadamente cinco estilos é suficiente para validar a
experiência. Sugestões iniciais:

1.  Minimalismo
2.  Bauhaus
3.  Brutalismo
4.  Y2K
5.  Vaporwave

A lista pode mudar durante a implementação. Os dados de demonstração
deverão ser inseridos por seeders.

## Princípio de escopo

**Começar simples e adaptar conforme o uso revelar novas necessidades.**

Não é prioridade inicial implementar colaboração complexa, publicação
pública, todos os tipos de relacionamento imagináveis, versionamento
avançado, recomendações automáticas ou inteligência artificial dentro do
produto.

## Arquitetura inicialmente escolhida

-   **Backend:** Laravel, API RESTful, Eloquent ORM, MySQL, migrations,
    models, seeders e Laravel Storage.
-   **Frontend:** Next.js com App Router, TypeScript e Tailwind CSS
    puro.
-   **Componentes:** componentes próprios inicialmente, sem biblioteca
    visual de componentes.
-   **Configuração:** variáveis sensíveis em arquivos `.env`; manter
    `.env.example` atualizado.

Detalhes e regras de implementação ficam em `FRONTEND.md`, `BACKEND.md`,
`DESIGN-SYSTEM.md` e `../CLAUDE.md`.

## Direção de evolução

A ordem de implementação deve ser ajustada à realidade do código,
mantendo o foco em validar o conceito. Uma sequência de referência é:
estrutura do projeto, configuração do Laravel/Next.js/MySQL,
autenticação, migrations e models, seed inicial, API, estrutura visual,
navegação e cards, páginas de conteúdo, edição, referências, pessoas,
estratégias, tags, favoritos, grupos e pesquisa global.

Este documento registra a ideia do produto. Se uma decisão técnica
mudar, atualize os documentos técnicos sem apagar silenciosamente a
intenção original.
