# Instruções para Claude e agentes de IA

## Antes de começar

1.  Leia `docs/IDEIA.md` para entender o produto.
2.  Leia os documentos técnicos pertinentes à tarefa:
    `docs/DESIGN-SYSTEM.md`, `docs/FRONTEND.md` e/ou `docs/BACKEND.md`.
3.  Consulte `docs/TASKS.md` e atualize o quadro de tarefas durante o
    trabalho.
4.  Consulte `docs/decisions/README.md` (índice) e leia a documentação
    da área que será alterada, das dependências diretas e os ADRs
    relacionados (veja "Documentação de decisões").
5.  Inspecione a estrutura e o código existentes antes de propor
    alterações. Não presuma que uma tarefa ainda está pendente sem
    verificar o repositório.

## Documentação de decisões (`docs/decisions/`)

Esta documentação responde "como funciona hoje" e "por que foi feito
assim". Ela faz parte do trabalho, não é tarefa posterior.

**Antes de alterar uma funcionalidade relevante:**

1.  Leia `docs/decisions/README.md`, o documento da área, o das
    dependências diretas e os ADRs citados.
2.  Compare o documento com o código real; se divergirem, o código vale
    e o documento deve ser corrigido.
3.  Respeite as decisões válidas. Para contrariar uma, é preciso uma
    razão concreta, registrada em ADR novo (veja abaixo).

**Na mesma etapa em que alterar:**

1.  Atualize o documento da área (funcionamento, arquivos, endpoints,
    modelos, decisões, limitações e situação). Crie um documento novo só
    para um assunto independente; não crie arquivos vazios nem um
    arquivo por pequena mudança.
2.  Registre decisões importantes com o porquê, alternativas
    consideradas de verdade, consequências e quando reconsiderar. Se o
    motivo não foi registrado, diga isso; não invente justificativa.
3.  Decisões de arquitetura, segurança, infraestrutura ou persistência
    ganham ADR em `docs/decisions/adr/` (próximo número sequencial,
    modelo no `adr/README.md`). ADR substituído nunca é apagado: marque
    como substituído e aponte para o novo.
4.  Atualize links cruzados e o índice `docs/decisions/README.md` (e os
    `README.md` locais). Não liste arquivos inexistentes.
5.  Não copie blocos grandes de código; explique e aponte caminhos. Não
    registre segredos. Distinga imagens de referência
    (`docs/assets/`) de imagens usadas pelo app
    (`frontend/public/images/`).
6.  Não marque algo como implementado só porque existe um arquivo ou
    componente: documente também limitações conhecidas.

## Regras obrigatórias de código

-   **Dados dinâmicos:** não deixe dados de negócio fixos no código da
    interface como se fossem dados reais. Consuma a API ou uma fonte de
    dados explicitamente destinada ao desenvolvimento. Valores
    constantes de configuração, enums e opções deliberadamente estáticas
    podem permanecer no código quando fizer sentido.
-   **Sem comentários no código:** não adicione comentários explicativos
    em arquivos de código. Prefira nomes claros, funções pequenas quando
    realmente necessárias e uma estrutura autoexplicativa. Comentários
    exigidos por ferramentas ou formatos podem ser usados somente quando
    não houver alternativa válida.
-   **Organização:** mantenha arquivos, componentes e responsabilidades
    bem organizados. Evite arquivos gigantes, duplicação e abstrações
    prematuras.
-   **Qualidade e legibilidade:** escreva código simples, consistente,
    fácil de ler e manter por uma pessoa. Prefira clareza a truques,
    excesso de compactação ou padrões desnecessários.
-   **Use o que a linguagem e o framework já oferecem:** antes de criar
    uma função utilitária, hook, helper, classe ou abstração, verifique
    se JavaScript/TypeScript, React, Next.js ou Laravel já resolvem o
    problema adequadamente. Não crie funções sem necessidade real.
-   **Nomes em inglês:** nomes de funções, variáveis, classes, tipos,
    componentes, arquivos de código e identificadores devem ser
    intuitivos e estar em inglês. Textos apresentados ao usuário podem
    seguir o idioma definido para a interface.
-   **Responsabilidade correta:** regras de segurança, validação e
    autorização devem ser verificadas no backend; não confie apenas na
    interface.
-   **Dependências:** não adicione bibliotecas sem uma necessidade
    concreta. Prefira recursos já disponíveis na stack.
-   **Segredos:** nunca inclua credenciais, tokens ou segredos no
    código, nos logs ou em documentação versionada.
-   **Escopo:** implemente somente o necessário para a tarefa atual. Não
    construa sistemas genéricos para possibilidades futuras sem
    necessidade confirmada.

## Processo de trabalho

1.  Entenda o pedido e inspecione os arquivos relevantes.
2.  Consulte as tarefas e identifique dependências.
3.  Faça a menor alteração coerente que resolva o problema.
4.  Reutilize padrões existentes quando forem bons; não perpetue um
    padrão claramente problemático sem avaliar.
5.  Execute lint, verificação de tipos e testes relevantes disponíveis.
6.  Revise erros, acessibilidade, estados de carregamento/vazio/erro e
    impactos em dados e permissões.
7.  Atualize `docs/TASKS.md`: marque como `DONE` somente o que foi
    implementado e verificado; registre bloqueios reais.
8.  Atualize a documentação técnica quando a decisão ou o comportamento
    do sistema mudar.
9.  Ao concluir, informe resumidamente o que foi feito, quais
    verificações foram executadas e o que ficou pendente.

## Regras específicas do projeto

-   Stack prevista: Laravel + API RESTful + Eloquent + MySQL no backend;
    Next.js App Router + TypeScript + Tailwind CSS no frontend.
-   A interface será construída com componentes próprios inicialmente,
    sem biblioteca visual de componentes.
-   A navegação principal usa sidebar.
-   A pesquisa global deverá poder ser aberta por `Ctrl + K` e
    `Cmd + K`.
-   Conteúdos pessoais pertencem ao usuário que os criou; somente
    usuários autorizados podem alterá-los.
-   Uma referência visual pode se relacionar com mais de uma entidade.
-   Tags são controladas e não devem ser criadas automaticamente a
    partir de qualquer texto.
-   Comece simples e implemente relações e funcionalidades conforme a
    necessidade real.
-   Cores e temas devem usar tokens semânticos para permitir futuras
    opções visuais. Não gaste tempo criando um sistema completo de temas
    antes de isso se tornar prioridade.

## Quando houver conflito entre documentos

-   `docs/IDEIA.md` registra a intenção do produto.
-   `docs/DESIGN-SYSTEM.md` define princípios visuais e de interação.
-   `docs/FRONTEND.md` define convenções do frontend.
-   `docs/BACKEND.md` define convenções do backend.
-   Este `CLAUDE.md` define como o agente deve trabalhar e as regras
    obrigatórias de implementação.
-   `docs/decisions/` registra como o sistema funciona hoje e por que
    foi construído assim (índice em `docs/decisions/README.md`).
-   `docs/TASKS.md` acompanha o estado atual do trabalho.

Se encontrar contradições ou decisões ultrapassadas, não as resolva
silenciosamente. Explique o conflito e atualize os documentos
pertinentes após decidir a abordagem com base no código e no objetivo do
produto.
