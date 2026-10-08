"use client";

import Link from "next/link";
import { useActionState } from "react";
import { savePerson } from "@/app/actions/content";
import { Button, LinkButton } from "@/components/ui/Button";
import { Form } from "@/components/ui/Form";
import { ImageField } from "@/components/ui/ImageField";
import { ChipCheckboxes } from "@/components/ui/ChipCheckboxes";
import { TextAreaField, TextField } from "@/components/ui/TextField";
import type { Person, Style, Tag } from "@/types/api";

export function PersonForm({ person, tags, styles }: { person?: Person; tags: Tag[]; styles: Style[] }) {
  const [state, action, pending] = useActionState(savePerson.bind(null, person?.slug ?? null), null);
  const error = (name: string) => state?.errors?.[name]?.[0];

  return (
    <Form action={action} className="max-w-3xl space-y-5">
      <TextField label="Nome" name="name" defaultValue={person?.name} required error={error("name")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Atuação" name="role" defaultValue={person?.role ?? ""} placeholder="Arquiteto, designer…" error={error("role")} />
        <TextField label="Período" name="period" defaultValue={person?.period ?? ""} placeholder="1887 - 1965" error={error("period")} />
      </div>
      <TextField label="Origem" name="origin" defaultValue={person?.origin ?? ""} error={error("origin")} />
      <TextAreaField label="Descrição curta" name="summary" rows={2} defaultValue={person?.summary ?? ""} error={error("summary")} />
      <ImageField
        urlName="photo_url"
        urlLabel="URL da foto"
        currentUrl={person?.photo_url ?? null}
        hasUploadedImage={person?.has_uploaded_image ?? false}
        errors={{ image: error("image"), url: error("photo_url") }}
      />
      <ChipCheckboxes
        legend="Tags"
        name="tags"
        hint={<Link href="/tags" className="underline">Gerenciar tags</Link>}
        options={tags.map((tag) => ({ value: tag.slug, label: tag.name }))}
        selected={person?.tags?.map((tag) => tag.slug)}
        error={error("tags.0")}
      />
      <ChipCheckboxes
        legend="Estilos relacionados"
        name="styles"
        options={styles.map((style) => ({ value: style.slug, label: style.name }))}
        selected={person?.styles?.map((style) => style.slug)}
        error={error("styles.0")}
        emptyMessage="Nenhum estilo cadastrado ainda."
      />
      <TextAreaField label="Biografia" name="biography" rows={8} defaultValue={person?.biography ?? ""} error={error("biography")} />

      {state?.message && Object.keys(state.errors ?? {}).length === 0 && (
        <p className="text-sm text-danger" role="alert">{state.message}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button>
        <LinkButton href={person ? `/pessoas/${person.slug}` : "/pessoas"} variant="secondary">Cancelar</LinkButton>
      </div>
    </Form>
  );
}
