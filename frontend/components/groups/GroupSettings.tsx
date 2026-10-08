"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteGroup, renameGroup } from "@/app/actions/content";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TextField } from "@/components/ui/TextField";
import type { Group } from "@/types/api";

export function GroupSettings({ group }: { group: Group }) {
  const [state, action, pending] = useActionState(renameGroup.bind(null, group.id), null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, startTransition] = useTransition();

  return (
    <div className="mb-8 flex flex-wrap items-end gap-4">
      <form action={action} className="flex flex-wrap items-end gap-3">
        <TextField label="Nome do grupo" name="name" defaultValue={group.name} required maxLength={80} error={state?.errors?.name?.[0]} />
        <Button type="submit" variant="secondary" disabled={pending}>Renomear</Button>
        {state?.success && <p role="status" className="pb-2 text-sm text-success">{state.message}</p>}
      </form>
      <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)}>Excluir grupo</Button>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Excluir o grupo "${group.name}"?`}
        message="Os conteúdos do grupo não serão apagados, apenas o agrupamento."
        pending={deleting}
        onConfirm={() => startTransition(() => deleteGroup(group.id))}
      />
    </div>
  );
}
