"use client";

import { useState, useTransition } from "react";
import { linkReferences } from "@/app/actions/references";
import { Button } from "@/components/ui/Button";
import { EntityPicker } from "@/components/ui/EntityPicker";
import { Modal } from "@/components/ui/Modal";
import type { EntityOption } from "@/types/api";

type LinkReferencesModalProps = {
  open: boolean;
  onClose: () => void;
  onLinked: () => void;
  referenceIds: number[];
};

export function LinkReferencesModal({ open, onClose, onLinked, referenceIds }: LinkReferencesModalProps) {
  const [target, setTarget] = useState<EntityOption[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const count = referenceIds.length;

  const submit = () =>
    startTransition(async () => {
      const [type, slug] = target[0].value.split(":");
      const result = await linkReferences(type as EntityOption["type"], slug, referenceIds);
      if (result?.success) {
        setTarget([]);
        setMessage(null);
        onLinked();
      } else {
        setMessage(result?.message ?? "Não foi possível vincular.");
      }
    });

  return (
    <Modal open={open} onClose={onClose} title="Vincular a um conteúdo" size="sm">
      <div className="space-y-5">
        <p className="text-sm text-text-muted">
          {count === 1 ? "A imagem selecionada passará" : `As ${count} imagens selecionadas passarão`} a aparecer no conteúdo escolhido, sem perder os vínculos atuais.
        </p>
        <EntityPicker legend="Conteúdo" selected={target} onChange={setTarget} multiple={false} />
        {message && <p role="alert" className="text-sm text-danger">{message}</p>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={submit} disabled={pending || target.length === 0}>{pending ? "Vinculando…" : "Vincular"}</Button>
        </div>
      </div>
    </Modal>
  );
}
