# ADR-009: Traduções pt_BR da API mantidas à mão

-   **Data:** 2026-10-08
-   **Status:** aceita

## Contexto

O Laravel não traz arquivos de tradução (`lang/`) por padrão. Com `APP_LOCALE=pt_BR`, mensagens de validação e de login saíam em inglês e chegavam à interface em português por engano. `CLAUDE.md` define o idioma da interface como português e pede cautela com dependências.

## Decisão

Escrever à mão `lang/pt_BR/auth.php`, `lang/pt_BR/validation.php` e `lang/pt_BR.json`, cobrindo apenas as regras e mensagens em uso, com nomes de campo traduzidos (`attributes`). Handlers de exceção em `bootstrap/app.php` traduzem 401 e 403.

## Justificativa

Evita uma dependência (por exemplo, pacotes de traduções do Laravel) para cobrir um conjunto pequeno de regras. Mantém controle do texto.

## Consequências

-   Cada nova regra de validação ou mensagem exige acrescentar a tradução; esquecer gera inglês ou a chave crua. Não há teste automático que detecte regras sem tradução (só testes pontuais de login, cadastro, 401 e 403).
-   Apenas um idioma. Adicionar outro exige novos arquivos e um mecanismo de escolha de locale.

## Alternativas consideradas

Pacote de traduções completo via Composer: não adotado agora por evitar dependência; reconsiderar se a lista de regras crescer ou for necessário outro idioma. Não foi discutida com o responsável.

## Referências

-   [Estrutura da API](../backend/api-structure.md)
-   `backend/lang/`, `backend/bootstrap/app.php`, `backend/phpunit.xml`
