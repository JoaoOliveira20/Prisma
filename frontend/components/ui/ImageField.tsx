"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ImageFieldProps = {
  urlName: string;
  urlLabel: string;
  currentUrl: string | null;
  hasUploadedImage: boolean;
  errors: { image?: string; url?: string };
  aspect?: string;
};

export function ImageField({ urlName, urlLabel, currentUrl, hasUploadedImage, errors, aspect = "aspect-[4/3]" }: ImageFieldProps) {
  const [chosenUrl, setChosenUrl] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => () => (chosenUrl ? URL.revokeObjectURL(chosenUrl) : undefined), [chosenUrl]);

  const preview = removing && !chosenUrl ? null : (chosenUrl ?? currentUrl);

  return (
    <div className="space-y-5">
      <div className={`relative w-full overflow-hidden bg-surface ${aspect}`}>
        {preview ? (
          <Image src={preview} alt="Pré-visualização da imagem" fill unoptimized sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" />
        ) : (
          <span className="eyebrow absolute inset-0 grid place-items-center">Sem imagem</span>
        )}
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Enviar imagem</span>
        <span className="block text-xs text-text-muted">JPG, PNG, WebP ou GIF, até 5 MB.</span>
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setChosenUrl(file ? URL.createObjectURL(file) : null);
          }}
          className="block w-full text-sm file:mr-3 file:rounded-sm file:border file:border-border-strong file:bg-transparent file:px-3 file:py-1.5 file:text-sm hover:file:bg-surface"
        />
        {errors.image && <span className="block text-xs text-danger" role="alert">{errors.image}</span>}
      </label>

      {hasUploadedImage && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="remove_image" checked={removing} onChange={(event) => setRemoving(event.target.checked)} />
          Remover a imagem enviada
        </label>
      )}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">{urlLabel}</span>
        <span className="block text-xs text-text-muted">Usada quando não há imagem enviada.</span>
        <input
          type="url"
          name={urlName}
          defaultValue={hasUploadedImage ? "" : (currentUrl ?? "")}
          placeholder="https://"
          aria-invalid={errors.url ? true : undefined}
          className="w-full rounded-sm border border-border-strong bg-surface-raised px-3.5 py-2.5 text-sm"
        />
        {errors.url && <span className="block text-xs text-danger" role="alert">{errors.url}</span>}
      </label>
    </div>
  );
}
