# Formulários de conteúdo

**Situação:** implementada (criar e editar estilos, pessoas e estratégias).

## Funcionamento

-   Páginas: `/estilos|pessoas|estrategias/novo` e `/…/[slug]/editar`, com cabeçalho editorial ("Novo registro · …" / "Editar · …"). **Layout em duas colunas** (`ui/FormLayout`): à esquerda, fixa ao rolar, a imagem com **pré-visualização**; à direita, seções com título em serifa e filete (`FormSection`: Identidade, Classificação/Relações, Conteúdo). A página de edição redireciona para o detalhe se `can.update` for falso (conveniência; a API é a barreira real).
-   Componentes: `components/styles/StyleForm.tsx`, `components/people/PersonForm.tsx`, `components/strategies/StrategyForm.tsx`. Usam `useActionState` com as Server Actions `saveStyle`, `savePerson`, `saveStrategy` (`app/actions/content.ts`).
-   Só o nome é obrigatório; o resto pode ser preenchido depois ("a base é viva", `../../IDEIA.md`).
-   Campos de lista: **Características** (estilo) é um texto com uma por linha, convertido em lista na action. **Tags** e **Estilos relacionados** (pessoa/estratégia) são caixas de seleção em formato de "chips" (`components/ui/ChipCheckboxes.tsx`). As tags disponíveis vêm de `/tags` (controladas: não há criação de tag no formulário).
-   Imagem: `components/ui/ImageField.tsx` mostra a imagem atual ou a **recém-escolhida** (pré-visualização local por `URL.createObjectURL`; "Remover a imagem enviada" a esconde) e oferece **envio de arquivo** (até 5 MB), opção "Remover a imagem enviada" (na edição, se houver upload) e **URL** (usada quando não há upload). O arquivo enviado tem precedência.
-   Erros: a API devolve erros por campo, exibidos junto de cada campo; falhas gerais aparecem em `role="alert"`. O botão mostra "Salvando…". **O que o usuário digitou é preservado** quando o servidor recusa: os formulários usam `components/ui/Form.tsx`, que chama a Server Action em `onSubmit` em vez de `<form action>`, porque o React 19 limpa os campos depois de toda ação (decisão tomada depois de um teste E2E mostrar o campo vazio após erro).
-   Sucesso: a action revalida o layout e redireciona para a página de detalhe do item.

## Como os dados são enviados (importante ao alterar)

As actions montam um **multipart** (`buildContentBody`, `lib/form.ts`) e fazem `POST` mesmo na edição, com `_method=PUT` (o PHP não lê multipart em `PUT`):

-   Texto vazio é enviado como `""` (a API converte em `null`), permitindo **limpar** um campo.
-   Listas vão como `chave[]`; lista **vazia** envia a chave com valor vazio, para a API distinguir "limpar" de "não enviado".
-   `image` só é enviado se um arquivo foi escolhido; `remove_image` se a caixa foi marcada.
-   `apiRequest` não define `Content-Type` quando o corpo é `FormData` (o `fetch` coloca o limite do multipart).

## Decisões

-   **Server Actions em vez de chamar a API do navegador:** ADR-003.
-   **Multipart para tudo:** um único formato cobre texto, listas e arquivo, ao custo de convenções (`_method`, marcador de lista vazia). JSON separado para o caso sem arquivo foi descartado para ter um só caminho.
-   Relações pessoa/estratégia → estilos são editadas **no formulário da pessoa/estratégia**; o formulário de estilo não edita pessoas nem estratégias (evita edição de relações pertencentes a outro dono).

## Limitações

-   Sem validação de tamanho no navegador (a API recusa, e o limite de corpo do Next é 6 MB).
-   Textos longos sem editor rico (texto simples).
-   Cancelar não pede confirmação se houver alterações.
-   Como o `Form` usa `onSubmit`, os formulários **dependem de JavaScript** (sem aprimoramento progressivo).

## Referência visual

Tela "11 editar estilo" do mockup (imagem à esquerda e campos de nome, descrição, período, origem e tags à direita). A implementação é um formulário único de uma coluna com seções empilhadas.
