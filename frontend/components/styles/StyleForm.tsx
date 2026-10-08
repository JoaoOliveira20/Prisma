"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveStyle } from "@/app/actions/content";
import { Button, LinkButton } from "@/components/ui/Button";
import { ChipCheckboxes } from "@/components/ui/ChipCheckboxes";
import { Form } from "@/components/ui/Form";
import { FormLayout, FormSection } from "@/components/ui/FormLayout";
import { ImageField } from "@/components/ui/ImageField";
import { TextAreaField, TextField } from "@/components/ui/TextField";
import type { Style, Tag } from "@/types/api";

export function StyleForm({ style, tags }: { style?: Style; tags: Tag[] }) {
  const [state, action, pending] = useActionState(saveStyle.bind(null, style?.slug ?? null), null);
  const error = (name: string) => state?.errors?.[name]?.[0];

  return (
    <Form action={action}>
      <FormLayout
        aside={
          <ImageField
            urlName="cover_url"
            urlLabel="URL da imagem de capa"
            currentUrl={style?.cover_url ?? null}
            hasUploadedImage={style?.has_uploaded_image ?? false}
            errors={{ image: error("image"), url: error("cover_url") }}
          />
        }
      >
        <FormSection title="Identidade">
          <TextField label="Nome" name="name" defaultValue={style?.name} required error={error("name")} />
          <TextAreaField label="Descrição curta" name="summary" rows={2} defaultValue={style?.summary ?? ""} error={error("summary")} />
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField label="Período" name="period" defaultValue={style?.period ?? ""} placeholder="1919 - 1933" error={error("period")} />
            <TextField label="Origem" name="origin" defaultValue={style?.origin ?? ""} error={error("origin")} />
          </div>
        </FormSection>

        <FormSection title="Classificação">
          <ChipCheckboxes
            legend="Tags"
            hint={<Link href="/tags" className="underline underline-offset-4">Gerenciar tags</Link>}
            name="tags"
            options={tags.map((tag) => ({ value: tag.slug, label: tag.name }))}
            selected={style?.tags?.map((tag) => tag.slug)}
            error={error("tags.0")}
          />
        </FormSection>

        <FormSection title="Conteúdo">
          <TextAreaField label="História" name="history" rows={8} defaultValue={style?.history ?? ""} error={error("history")} />
          <TextAreaField label="Características (uma por linha)" name="characteristics" rows={5} defaultValue={style?.characteristics.join("\n") ?? ""} error={error("characteristics")} />
          <TextAreaField label="Influências" name="influences" rows={3} defaultValue={style?.influences ?? ""} error={error("influences")} />
        </FormSection>

        {state?.message && Object.keys(state.errors ?? {}).length === 0 && <p className="text-sm text-danger" role="alert">{state.message}</p>}

        <div className="flex gap-3 border-t border-border pt-8">
          <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button>
          <LinkButton href={style ? `/estilos/${style.slug}` : "/estilos"} variant="secondary">Cancelar</LinkButton>
        </div>
      </FormLayout>
    </Form>
  );
}
