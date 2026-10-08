"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { deleteTag, renameTag } from "@/app/actions/tags";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Tag } from "@/types/api";

export function TagRow({ tag }: { tag: Tag }) {
  const [renameState, renameAction, renaming] = useActionState(renameTag.bind(null, tag.slug), null);
  const [deleteState, deleteAction, deleting] = useActionState(deleteTag.bind(null, tag.slug), null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [, startTransition] = useTransition();
  const usage = tag.usage_count ?? 0;
  const message = renameState?.errors?.name?.[0] ?? renameState?.message ?? deleteState?.message;
  const isError = Boolean(message) && !renameState?.success && !deleteState?.success;

  return (
    <li className="space-y-2 rounded-md border border-border bg-surface-raised p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-serif text-lg">{tag.name}</p>
          <p className="text-xs text-text-muted">
            {usage} {usage === 1 ? "conteúdo" : "conteúdos"}
            {!tag.can?.update && " · somente leitura"}
          </p>
        </div>
        <nav aria-label={`Conteúdos com a tag ${tag.name}`} className="flex gap-3 text-xs text-text-muted">
          <Link href={`/estilos?tag=${tag.slug}`} className="hover:text-text">Estilos</Link>
          <Link href={`/pessoas?tag=${tag.slug}`} className="hover:text-text">Pessoas</Link>
          <Link href={`/estrategias?tag=${tag.slug}`} className="hover:text-text">Estratégias</Link>
        </nav>
      </div>

      {tag.can?.update && (
        <div className="flex flex-wrap items-center gap-2">
          <form action={renameAction} className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor={`rename-${tag.slug}`}>Novo nome da tag {tag.name}</label>
            <input
              id={`rename-${tag.slug}`}
              name="name"
              defaultValue={tag.name}
              required
              maxLength={40}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
            />
            <Button type="submit" variant="secondary" disabled={renaming}>Renomear</Button>
          </form>
          {tag.can.delete && (
            <>
              <Button type="button" variant="danger" disabled={deleting || usage > 0} title={usage > 0 ? "Tag em uso não pode ser excluída" : undefined} onClick={() => setConfirmOpen(true)}>
                Excluir
              </Button>
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
            </>
          )}
        </div>
      )}

      {message && <p role={isError ? "alert" : "status"} className={`text-sm ${isError ? "text-danger" : "text-success"}`}>{message}</p>}
    </li>
  );
}
