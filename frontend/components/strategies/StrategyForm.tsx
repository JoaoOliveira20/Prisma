"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveStrategy } from "@/app/actions/content";
import { Button, LinkButton } from "@/components/ui/Button";
import { ChipCheckboxes } from "@/components/ui/ChipCheckboxes";
import { Form } from "@/components/ui/Form";
import { FormLayout, FormSection } from "@/components/ui/FormLayout";
import { ImageField } from "@/components/ui/ImageField";
import { TextAreaField, TextField } from "@/components/ui/TextField";
import type { Strategy, Style, Tag } from "@/types/api";

export function StrategyForm({ strategy, tags, styles }: { strategy?: Strategy; tags: Tag[]; styles: Style[] }) {
  const [state, action, pending] = useActionState(saveStrategy.bind(null, strategy?.slug ?? null), null);
  const error = (name: string) => state?.errors?.[name]?.[0];

  return (
    <Form action={action}>
      <FormLayout
        aside={
          <ImageField
            urlName="cover_url"
            urlLabel="URL da imagem de capa"
            currentUrl={strategy?.cover_url ?? null}
            hasUploadedImage={strategy?.has_uploaded_image ?? false}
            errors={{ image: error("image"), url: error("cover_url") }}
          />
        }
      >
        <FormSection title="Identidade">
          <TextField label="Nome" name="name" defaultValue={strategy?.name} required error={error("name")} />
          <TextField label="Categoria" name="category" defaultValue={strategy?.category ?? ""} placeholder="Princípio, metodologia, manifesto…" error={error("category")} />
          <TextAreaField label="Descrição curta" name="summary" rows={2} defaultValue={strategy?.summary ?? ""} error={error("summary")} />
        </FormSection>

        <FormSection title="Relações">
          <ChipCheckboxes
            legend="Tags"
            name="tags"
            hint={<Link href="/tags" className="underline underline-offset-4">Gerenciar tags</Link>}
            options={tags.map((tag) => ({ value: tag.slug, label: tag.name }))}
            selected={strategy?.tags?.map((tag) => tag.slug)}
            error={error("tags.0")}
          />
          <ChipCheckboxes
            legend="Estilos relacionados"
            name="styles"
            options={styles.map((style) => ({ value: style.slug, label: style.name }))}
            selected={strategy?.styles?.map((style) => style.slug)}
            error={error("styles.0")}
            emptyMessage="Nenhum estilo cadastrado ainda."
          />
        </FormSection>

        <FormSection title="Descrição">
          <TextAreaField label="Descrição completa" name="description" rows={8} defaultValue={strategy?.description ?? ""} error={error("description")} />
        </FormSection>

        {state?.message && Object.keys(state.errors ?? {}).length === 0 && <p className="text-sm text-danger" role="alert">{state.message}</p>}

        <div className="flex gap-3 border-t border-border pt-8">
          <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button>
          <LinkButton href={strategy ? `/estrategias/${strategy.slug}` : "/estrategias"} variant="secondary">Cancelar</LinkButton>
        </div>
      </FormLayout>
    </Form>
  );
}
