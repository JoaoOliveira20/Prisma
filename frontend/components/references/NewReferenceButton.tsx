"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ReferenceModal } from "./ReferenceModal";

export function NewReferenceButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" className="shrink-0" onClick={() => setOpen(true)}>Nova referência</Button>
      <ReferenceModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
