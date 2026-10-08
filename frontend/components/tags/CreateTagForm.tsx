"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTag } from "@/app/actions/tags";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/ui/Form";
import { TextField } from "@/components/ui/TextField";

export function CreateTagForm() {
  const [state, action, pending] = useActionState(createTag, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <Form ref={formRef} action={action} className="flex max-w-md flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <TextField label="Nova tag" name="name" required maxLength={40} placeholder="Ex.: Surrealismo" error={state?.errors?.name?.[0]} />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Criando…" : "Criar tag"}</Button>
      {state?.success && <p role="status" className="basis-full text-sm text-success">{state.message}</p>}
    </Form>
  );
}
