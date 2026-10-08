"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ReferenceModal } from "./ReferenceModal";

export function NewReferenceButton({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>Nova referência</Button>
      <ReferenceModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
