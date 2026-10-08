# Frontend

## Stack

-   Next.js com App Router.
-   TypeScript.
-   Tailwind CSS puro.
-   Componentes próprios inicialmente, sem biblioteca visual de
    componentes.

## Responsabilidades

O frontend apresenta os conteúdos, gerencia a interação do usuário e
consome a API do backend. Regras de autorização e validação de segurança
devem ser garantidas no backend, não apenas na interface.

## Organização

Organize o código por responsabilidade e domínio, respeitando os padrões
existentes no repositório. Evite criar uma arquitetura excessivamente
abstrata antes de haver necessidade.

Uma organização de referência, a adaptar à estrutura real:

-   `app/`: rotas, layouts e páginas do App Router.
-   `components/`: componentes reutilizáveis de interface.
-   `features/`: lógica e componentes específicos de funcionalidades, se
    o projeto justificar essa separação.
-   `lib/`: clientes de API e utilitários compartilhados realmente
    necessários.
-   `types/`: tipos compartilhados quando não fizer sentido mantê-los
    junto à funcionalidade.
-   `styles/`: estilos globais e tokens, quando aplicável.

Não crie todas essas pastas por obrigação. Prefira uma estrutura menor e
clara a pastas vazias ou camadas sem função.

## Regras de implementação

-   Use TypeScript com tipos explícitos onde isso melhora a segurança e
    a leitura.
-   Prefira Server Components por padrão; use Client Components quando
    houver necessidade real de estado, efeitos ou APIs do navegador.
-   Evite duplicar lógica e estado.
-   Use recursos nativos do React, Next.js e da linguagem antes de
    introduzir abstrações próprias.
-   Não crie funções ou componentes genéricos sem um uso claro.
-   Use nomes intuitivos em inglês para funções, variáveis, componentes,
    tipos e arquivos de código.
-   Não adicione comentários ao código. Escreva código autoexplicativo;
    se algo estiver difícil de entender, prefira melhorar a estrutura e
    os nomes.
-   Não codifique dados de conteúdo como se fossem dados definitivos de
    produção. Conteúdos dinâmicos devem vir da API ou de uma fonte
    explicitamente definida para desenvolvimento.
-   Não coloque segredos no frontend. Variáveis expostas ao navegador
    não são secretas.
-   Evite `any`; modele os dados com tipos adequados.
-   Trate estados de carregamento, erro, vazio e sucesso.
-   Mantenha acessibilidade e navegação por teclado em componentes
    interativos.
-   Evite dependências novas quando a plataforma ou o framework já
    oferecem uma solução adequada.

## API e dados

-   Centralize a configuração e o acesso à API quando isso evitar
    duplicação.
-   Defina tipos coerentes com os contratos da API.
-   Não simule persistência em memória para funcionalidades que precisam
    sobreviver ao recarregamento.
-   Não exponha tokens, credenciais ou detalhes internos do backend.
-   Trate respostas inválidas e falhas de rede de forma previsível.
-   Use variáveis de ambiente para endereços configuráveis, com valores
    de exemplo documentados em `.env.example`.

## Interface prevista

-   Sidebar retrátil.
-   Pesquisa global / Command Palette com `Ctrl + K` e `Cmd + K`.
-   Tela de descoberta com filtros e cards.
-   Páginas detalhadas para estilos, pessoas e estratégias.
-   Galeria de referências e Lightbox.
-   Favoritos, tags e grupos.
-   Edição dentro das páginas, respeitando permissões informadas pelo
    backend.

Implemente por etapas; não construa todas as telas antes de validar os
padrões fundamentais.

## Qualidade

Antes de considerar uma tarefa concluída:

1.  Execute o lint e a verificação de tipos disponíveis.
2.  Execute testes relevantes, se existirem.
3.  Confirme os estados de carregamento, erro e vazio da funcionalidade.
4.  Revise a responsividade e a acessibilidade da interface alterada.
5.  Atualize `TASKS.md` e a documentação pertinente.
