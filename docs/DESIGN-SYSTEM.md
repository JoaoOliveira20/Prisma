# Design System

## Objetivo

Definir princípios visuais e de interação para que a interface seja
consistente, acessível e fácil de evoluir sem limitar a expressão visual
do produto.

## Princípios

1.  **Conteúdo em primeiro lugar:** referências, imagens e relações
    devem ser o foco da experiência.
2.  **Hierarquia clara:** títulos, descrições, metadados e ações devem
    ser distinguíveis.
3.  **Consistência:** componentes equivalentes devem se comportar e
    parecer equivalentes.
4.  **Flexibilidade:** o sistema deve suportar diferentes tipos de
    conteúdo e futuras variações de aparência.
5.  **Acessibilidade:** foco visível, contraste suficiente, navegação
    por teclado, rótulos acessíveis e estados compreensíveis.
6.  **Responsividade:** a interface deve funcionar em telas pequenas,
    médias e grandes.
7.  **Sobriedade funcional:** animações e efeitos devem apoiar a
    compreensão, não competir com o conteúdo.

## Cores e temas

A paleta inicial deve ser implementada com tokens semânticos, não com
cores repetidas diretamente em cada componente. Não é necessário decidir
agora uma coleção definitiva de temas. A arquitetura deve permitir
adicionar opções de aparência no futuro sem reescrever os componentes.

Tokens conceituais recomendados:

-   `--color-background`
-   `--color-surface`
-   `--color-surface-raised`
-   `--color-text`
-   `--color-text-muted`
-   `--color-border`
-   `--color-primary`
-   `--color-primary-foreground`
-   `--color-accent`
-   `--color-success`
-   `--color-warning`
-   `--color-danger`
-   `--color-focus-ring`

Use tokens semânticos em vez de nomes que descrevam apenas a cor física,
como `purple-500`, quando a cor representa uma função de interface. As
cores concretas e os temas disponíveis poderão ser definidos durante a
implementação.

## Tipografia

-   Definir uma escala tipográfica consistente para títulos, texto,
    rótulos e metadados.
-   Priorizar legibilidade e comprimentos de linha confortáveis.
-   Evitar usar tamanho, peso e cor como os únicos meios de transmitir
    significado.
-   Usar nomes e textos de interface claros e consistentes.

## Espaçamento e layout

-   Manter uma escala de espaçamento consistente.
-   Alinhar cards, formulários, cabeçalhos e seções usando regras
    comuns.
-   Evitar valores arbitrários repetidos quando um token ou utilitário
    existente resolve.
-   A sidebar deve ser a navegação principal e comportar estados
    expandido e minimizado.
-   O conteúdo principal deve preservar espaço suficiente para imagens e
    leitura.

## Componentes visuais previstos

-   Sidebar e itens de navegação.
-   Campo de pesquisa e Command Palette.
-   Cards de estilo, pessoa, estratégia e referência.
-   Galeria e Lightbox/Modal.
-   Tabs e seções de conteúdo.
-   Filtros, tags e botões de favorito.
-   Formulários e controles de edição.
-   Estados de carregamento, vazio, erro e sucesso.

Os componentes devem ser criados conforme a necessidade real. A lista
não é uma obrigação de implementar tudo de uma vez.

## Estados e interação

Todo componente interativo deve considerar, quando aplicável:

-   padrão;
-   hover;
-   foco por teclado;
-   pressionado;
-   selecionado/ativo;
-   desabilitado;
-   carregando;
-   erro;
-   sucesso;
-   vazio.

Ações destrutivas devem ser visualmente diferenciadas e, quando
necessário, pedir confirmação. A interface não deve depender
exclusivamente de cor para indicar estados.

## Imagens e referências

-   Dar prioridade visual às imagens sem prejudicar a leitura de títulos
    e metadados.
-   Definir proporções e comportamentos de recorte coerentes por tipo de
    card.
-   Evitar distorcer imagens; usar `object-fit` ou solução equivalente
    quando adequado.
-   Tratar falhas de carregamento e imagens ausentes com estados de
    fallback.
-   Respeitar fontes, créditos e URLs de origem quando essas informações
    existirem.

## Movimento

Animações devem ser curtas, funcionais e discretas. Respeitar a
preferência do sistema por movimento reduzido. Não adicionar animações
apenas por decoração.

## Implementação

-   Frontend: Next.js, TypeScript e Tailwind CSS puro.
-   Criar componentes próprios inicialmente; não adicionar biblioteca
    visual sem uma necessidade clara.
-   Centralizar tokens de design para facilitar mudanças futuras.
-   Evitar estilos duplicados e exceções locais sem justificativa.
-   O design system é uma referência viva: atualizar este arquivo quando
    decisões visuais relevantes forem tomadas.

## Decisões visuais implementadas

A direção adotada ("arquivo editorial"), os tokens vigentes, a tipografia, os componentes e a verificação de acessibilidade estão em `decisions/frontend/design-system.md` e no `decisions/adr/ADR-013-editorial-archive-direction.md`. Os tokens concretos diferem da lista conceitual acima apenas por acréscimos (`border-strong`, `sidebar*`, `night*`).
