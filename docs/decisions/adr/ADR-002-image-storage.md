# ADR-002: Imagens enviadas no disco público do Laravel

-   **Data:** 2026-10-08
-   **Status:** aceita

## Contexto

`../../BACKEND.md` pede Laravel Storage para arquivos enviados, validação no servidor e armazenamento fora de locais executáveis. `../../IDEIA.md` prevê referências por URL **ou** upload. Capas de estilos e estratégias e fotos de pessoas também precisam aceitar upload.

## Decisão

-   Arquivos ficam no disco `public` (`storage/app/public`), expostos por `public/storage` (`artisan storage:link`).
-   O banco guarda o **caminho** em `image_path` e, separadamente, a URL externa (`image_url`, `cover_url` ou `photo_url`). **O arquivo enviado tem precedência** sobre a URL ao exibir.
-   Nomes de arquivo são gerados pelo Laravel (hash); o nome do cliente nunca é usado.
-   Validação: `File::image()` sem SVG, máximo 5 MB; o Laravel verifica o conteúdo, não só a extensão.
-   O arquivo é apagado quando o registro é excluído ou a imagem é substituída/removida.

## Justificativa

Solução nativa do framework, sem dependências. Manter URL e caminho separados permite trocar de volta para a URL ao remover o upload e distingue as duas origens (requisito de `BACKEND.md`).

## Exceção

O seeder grava SVGs originais do projeto como imagens de demonstração; SVG segue proibido em uploads de usuários (2026-10-08).

## Consequências

-   URLs públicas e adivinháveis só pelo hash; não há controle de acesso por usuário nas imagens.
-   Sem redimensionamento nem miniaturas: o Next serve imagens com `unoptimized`, então o tamanho original é transferido.
-   O link `public/storage` precisa ser criado em cada ambiente.
-   Para S3 ou similar, basta trocar o disco, mas as URLs geradas por `Storage::url` mudam.

## Alternativas consideradas

-   Disco privado com rota autenticada de download: descartada por ora porque o conteúdo não é secreto e complicaria o uso de `<img>`. Não foi discutida com o responsável.

## Referências

-   [Armazenamento de imagens](../backend/image-storage.md)
-   `backend/app/Models/Concerns/HasUploadedImage.php`, `backend/app/Models/ReferenceItem.php`
