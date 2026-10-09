"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import { deleteTag, renameTag } from "@/app/actions/tags";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Form } from "@/components/ui/Form";
import type { Tag } from "@/types/api";

function RenameField({ tag, onDone }: { tag: Tag; onDone: () => void }) {
  const [state, action, pending] = useActionState(renameTag.bind(null, tag.slug), null);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  const error = state?.errors?.name?.[0] ?? (state?.message && !state.success ? state.message : null);

  return (
    <Form action={action} className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <label className="sr-only" htmlFor={`rename-${tag.slug}`}>Novo nome da tag {tag.name}</label>
      <input
        id={`rename-${tag.slug}`}
        name="name"
        defaultValue={tag.name}
        required
        maxLength={40}
        autoFocus
        className="h-12 min-w-0 flex-1 border-b border-text bg-transparent font-serif text-3xl"
      />
      <button type="submit" disabled={pending} className="text-sm font-medium underline underline-offset-4">Salvar</button>
      <button type="button" onClick={onDone} className="text-sm text-text-muted underline-offset-4 hover:text-text hover:underline">Cancelar</button>
      {error && <p role="alert" className="basis-full text-sm text-danger">{error}</p>}
    </Form>
  );
}

export function TagRow({ tag }: { tag: Tag }) {
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteState, deleteAction, deleting] = useActionState(deleteTag.bind(null, tag.slug), null);
  const [, startTransition] = useTransition();
  const usage = tag.usage_count ?? 0;
  const deleteError = deleteState && !deleteState.success ? deleteState.message : null;

  return (
    <li className="grid gap-x-8 gap-y-3 border-b border-border py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline">
      <div className="min-w-0">
        {editing ? (
          <RenameField tag={tag} onDone={() => setEditing(false)} />
        ) : (
          <h2 className="font-serif text-3xl leading-tight">{tag.name}</h2>
        )}
        <div className="mt-2 text-sm text-text-muted">
          <span className="tabular">{usage}</span> {usage === 1 ? "conteúdo" : "conteúdos"}
          <span className="mx-2" aria-hidden="true">·</span>
          <nav aria-label={`Conteúdos com a tag ${tag.name}`} className="inline">
            <Link href={`/estilos?tag=${tag.slug}`} className="underline-offset-4 hover:text-text hover:underline">Estilos</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <Link href={`/pessoas?tag=${tag.slug}`} className="underline-offset-4 hover:text-text hover:underline">Pessoas</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <Link href={`/estrategias?tag=${tag.slug}`} className="underline-offset-4 hover:text-text hover:underline">Estratégias</Link>
          </nav>
        </div>
        {deleteError && <p role="alert" className="mt-2 text-sm text-danger">{deleteError}</p>}
      </div>

      {tag.can?.update && !editing && (
        <div className="flex items-baseline gap-6 text-sm">
          <button type="button" onClick={() => setEditing(true)} className="underline-offset-4 hover:underline">Renomear</button>
          {tag.can.delete && (
            <button
              type="button"
              disabled={deleting || usage > 0}
              title={usage > 0 ? "Tag em uso não pode ser excluída" : undefined}
              onClick={() => setConfirmOpen(true)}
              className="text-danger underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-text-muted/60 disabled:no-underline"
            >
              Excluir
            </button>
          )}
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Excluir a tag "${tag.name}"?`}
        message="A tag será removida do vocabulário. Esta ação não pode ser desfeita."
        pending={deleting}
        onConfirm={() => {
          setConfirmOpen(false);
          startTransition(() => deleteAction());
        }}
      />
    </li>
  );
}
