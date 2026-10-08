"use client";

import { useActionState, useEffect, useState } from "react";
import { createGroup } from "@/app/actions/content";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";

function CreateGroupForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(createGroup, null);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <Form action={action} className="space-y-6">
      <TextField label="Nome da coleção" name="name" required maxLength={80} placeholder="Ex.: Estudar depois" error={state?.errors?.name?.[0]} />
      {state?.message && !state.success && Object.keys(state.errors ?? {}).length === 0 && <p role="alert" className="text-sm text-danger">{state.message}</p>}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onDone}>Cancelar</Button>
        <Button type="submit" disabled={pending}>{pending ? "Criando…" : "Criar coleção"}</Button>
      </div>
    </Form>
  );
}

export function CreateGroupButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>Nova coleção</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nova coleção" size="sm">
        <CreateGroupForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
