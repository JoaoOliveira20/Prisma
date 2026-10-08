"use client";

import { Button } from "./Button";
import { Modal } from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  pending?: boolean;
};

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Excluir", pending = false }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>Cancelar</Button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={pending}>{pending ? "Aguarde…" : confirmLabel}</Button>
      </div>
    </Modal>
  );
}
