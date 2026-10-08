type ImageFieldProps = {
  urlName: string;
  urlLabel: string;
  currentUrl: string | null;
  hasUploadedImage: boolean;
  errors: { image?: string; url?: string };
};

export function ImageField({ urlName, urlLabel, currentUrl, hasUploadedImage, errors }: ImageFieldProps) {
  return (
    <div className="space-y-4 rounded-md border border-border bg-surface-raised p-4">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-text-muted">Enviar imagem (JPG, PNG, WebP ou GIF, até 5 MB)</span>
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-sm" />
        {errors.image && <span className="block text-xs text-danger" role="alert">{errors.image}</span>}
      </label>
      {hasUploadedImage && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="remove_image" />
          Remover a imagem enviada
        </label>
      )}
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-text-muted">{urlLabel} (usada quando não há imagem enviada)</span>
        <input
          type="url"
          name={urlName}
          defaultValue={hasUploadedImage ? "" : (currentUrl ?? "")}
          placeholder="https://"
          aria-invalid={errors.url ? true : undefined}
          className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm"
        />
        {errors.url && <span className="block text-xs text-danger" role="alert">{errors.url}</span>}
      </label>
    </div>
  );
}
