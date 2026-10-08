# Armazenamento de imagens

**Situação:** implementada. Decisão: [ADR-002](../adr/ADR-002-image-storage.md).

## Onde há imagens

| Entidade | Campo de URL | Upload |
| --- | --- | --- |
| Estilo | `cover_url` | `image` |
| Pessoa | `photo_url` | `image` |
| Estratégia | `cover_url` | `image` |
| Referência | `image_url` | `image` (obrigatório ter um dos dois) |

Estilo, pessoa e estratégia gravam o arquivo em `image_path` (pasta `images/`). Referências usam `reference_items.image_path` (pasta `references/`).

## Funcionamento

-   Disco `public` do Laravel (`storage/app/public`), exposto por `public/storage` (`kool run artisan storage:link`, uma vez por ambiente). URL final: `APP_URL/storage/...`.
-   **Precedência:** se existe `image_path`, ele é a imagem exibida; senão, vale a URL externa. Remover o upload (`remove_image=1`) volta a exibir a URL.
-   Enviar uma imagem nova **substitui** a anterior e apaga o arquivo antigo. Excluir o registro apaga o arquivo.
-   Para estilo, pessoa e estratégia a lógica está no trait `HasUploadedImage` (`applyImageChanges`, `displayImageUrl`, `imageRules`); cada modelo informa sua coluna de URL em `imageUrlColumn()`. `ReferenceItem` tem implementação própria equivalente (`displayUrl`), porque suas imagens são imutáveis e obrigatórias.

## Imagens de demonstração (exceção)

O seeder grava SVGs originais do projeto (`database/seeders/images/*.svg`) como imagens enviadas. SVG continua **proibido em uploads de usuários**; os arquivos de demonstração são nossos e não vêm de entrada externa.

## Segurança

-   Validação no servidor: `File::image(allowSvg: false)->max(5 MB)`; verifica o tipo real do arquivo, não só a extensão. SVG é rejeitado (risco de script).
-   O nome do arquivo é gerado (hash), nunca o do cliente.
-   Os arquivos ficam em `storage/`, fora de pasta executável; apenas `public/storage` é exposto.
-   URLs externas aceitam só `http`/`https`.

## Limitações

-   Sem redimensionamento ou miniaturas; o frontend usa `unoptimized` e baixa o arquivo original.
-   URLs públicas, sem controle de acesso por usuário.
-   Imagem de referência não pode ser trocada depois de criada (só remover e recriar).
-   Nenhum processo remove arquivos órfãos caso o banco seja recriado com `migrate:fresh` (os arquivos em `storage/app/public` permanecem).
