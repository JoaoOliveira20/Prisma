"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ContentType } from "@/types/api";
import { ReferenceModal } from "./ReferenceModal";

export function AddReferenceButton({ type, slug }: { type: ContentType; slug: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>Adicionar referência</Button>
      <ReferenceModal open={open} onClose={() => setOpen(false)} fixedLink={`${type}:${slug}`} />
    </>
  );
}
