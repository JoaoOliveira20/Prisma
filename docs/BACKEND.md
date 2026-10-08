# Backend

## Stack

-   Laravel.
-   API RESTful.
-   Eloquent ORM.
-   MySQL.
-   Migrations, Models e Seeders.
-   Laravel Storage para arquivos enviados.

## Responsabilidades

O backend é responsável por persistência, validação, autenticação,
autorização, relações entre entidades, processamento de uploads e
contratos da API. O frontend nunca deve ser considerado uma barreira de
segurança suficiente.

## Domínios iniciais

-   `users`: autenticação e identidade.
-   `styles`: estilos e movimentos.
-   `people`: designers, artistas, teóricos e outros criadores.
-   `strategies`: práticas, princípios, manifestos e metodologias.
-   `reference_items`: referências visuais e suas informações.
-   `tags`: vocabulário controlado.
-   `favorites`: conteúdos favoritados pelo usuário.
-   `groups`: coleções pessoais e seus itens.

A modelagem exata deve acompanhar as necessidades confirmadas. Não
implemente todas as relações futuras de uma só vez.

## Regras de dados e propriedade

-   Cada conteúdo pessoal deve ter um proprietário identificável quando
    aplicável.
-   Usuários só podem alterar ou remover conteúdos que tenham permissão
    para administrar.
-   A autorização deve ser verificada no backend em cada operação
    protegida.
-   Não confie em `user_id` enviado pelo cliente sem validar o usuário
    autenticado e a regra de negócio.
-   Valide e normalize os dados de entrada.
-   Use migrations para alterações de esquema; não dependa de mudanças
    manuais não documentadas no banco.
-   Mantenha chaves estrangeiras, índices e restrições coerentes com as
    consultas e relações utilizadas.
-   Use transações quando uma operação exigir que várias alterações
    sejam concluídas em conjunto.

## API

-   Mantenha respostas e códigos HTTP consistentes.
-   Valide os dados recebidos antes de persistir.
-   Não retorne campos sensíveis ou internos sem necessidade.
-   Trate erros de forma previsível e sem expor stack traces ou segredos
    em produção.
-   Documente alterações relevantes nos contratos consumidos pelo
    frontend.
-   Prefira soluções idiomáticas do Laravel em vez de reimplementar
    funcionalidades que o framework já oferece.

## Modelagem e relacionamentos

-   Use Eloquent e relacionamentos explícitos.
-   Uma referência pode se relacionar com mais de uma entidade; não
    assuma que pertence exclusivamente a um estilo.
-   Relações muitos-para-muitos devem ser modeladas de forma clara.
-   Tags são controladas: não crie automaticamente uma nova tag a partir
    de qualquer texto arbitrário.
-   Relações com significado específico podem receber um tipo de
    relacionamento quando necessário, sem antecipar uma taxonomia
    complexa.
-   Evite consultas repetitivas e problemas de N+1; carregue relações de
    acordo com o caso de uso.

## Uploads e armazenamento

-   Use Laravel Storage para gerenciar arquivos.
-   Valide tipo, tamanho e demais restrições dos arquivos no servidor.
-   Não confie apenas na extensão ou no `Content-Type` informado pelo
    cliente.
-   Evite nomes de arquivo fornecidos pelo usuário como caminho final.
-   Armazene arquivos fora de locais executáveis e aplique as regras de
    acesso apropriadas.
-   Considere URLs externas e arquivos enviados como origens diferentes
    de referência.

## Segurança e configuração

-   Use `.env` para valores específicos do ambiente e segredos.
-   Mantenha `.env.example` atualizado com nomes e exemplos não
    sensíveis.
-   Nunca versione credenciais reais.
-   Use os mecanismos de autenticação e autorização adequados à
    arquitetura escolhida.
-   Não desative proteções do framework para contornar problemas sem
    entender a causa.

## Seeders e dados de desenvolvimento

Use seeders para criar um conjunto pequeno e reproduzível de dados de
demonstração, começando por cerca de cinco estilos. Os seeders devem
poder ser executados de forma previsível e não devem depender de dados
pessoais reais.

## Qualidade

Antes de concluir uma tarefa:

1.  Execute os testes relevantes disponíveis.
2.  Verifique migrations e relações afetadas.
3.  Confirme autorização para acesso, edição e remoção.
4.  Verifique validação e tratamento de erros.
5.  Atualize `TASKS.md` e a documentação dos contratos afetados.
