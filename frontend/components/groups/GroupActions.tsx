"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { deleteGroup, renameGroup } from "@/app/actions/content";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Form } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import type { Group } from "@/types/api";

function RenameForm({ group, onDone }: { group: Group; onDone: () => void }) {
  const [state, action, pending] = useActionState(renameGroup.bind(null, group.id), null);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <Form action={action} className="space-y-6">
      <TextField label="Nome da coleção" name="name" defaultValue={group.name} required maxLength={80} error={state?.errors?.name?.[0]} />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onDone}>Cancelar</Button>
        <Button type="submit" disabled={pending}>Renomear</Button>
      </div>
    </Form>
  );
}

export function GroupActions({ group }: { group: Group }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, startTransition] = useTransition();

  return (
    <>
      <ActionMenu
        items={[
          { label: "Renomear", onSelect: () => setRenameOpen(true) },
          { label: "Excluir", danger: true, onSelect: () => setConfirmOpen(true) },
        ]}
      />
      <Modal open={renameOpen} onClose={() => setRenameOpen(false)} title="Renomear coleção" size="sm">
        <RenameForm group={group} onDone={() => setRenameOpen(false)} />
      </Modal>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Excluir "${group.name}"?`}
        message="Os conteúdos da coleção não serão apagados, apenas o agrupamento."
        pending={deleting}
        onConfirm={() => startTransition(() => deleteGroup(group.id))}
      />
    </>
  );
}
