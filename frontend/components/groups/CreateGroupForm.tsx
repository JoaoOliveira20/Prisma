"use client";

import { useActionState, useEffect, useRef } from "react";
import { createGroup } from "@/app/actions/content";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/ui/Form";
import { TextField } from "@/components/ui/TextField";

export function CreateGroupForm() {
  const [state, action, pending] = useActionState(createGroup, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <Form ref={formRef} action={action} className="flex max-w-md flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <TextField label="Novo grupo" name="name" required maxLength={80} placeholder="Ex.: Estudar depois" error={state?.errors?.name?.[0]} />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Criando…" : "Criar grupo"}</Button>
    </Form>
  );
}
