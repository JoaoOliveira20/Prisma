"use client";

import { useActionState, useEffect, useState } from "react";
import { createReference, updateReference } from "@/app/actions/references";
import { Button } from "@/components/ui/Button";
import { ChipCheckboxes } from "@/components/ui/ChipCheckboxes";
import { Form } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { TextAreaField, TextField } from "@/components/ui/TextField";
import type { GalleryItem, LinkOption } from "@/types/api";
import { LinkExistingPanel } from "./LinkExistingPanel";

type LinkOptions = { styles: LinkOption[]; people: LinkOption[]; strategies: LinkOption[] };

type ReferenceModalProps = {
  open: boolean;
  onClose: () => void;
  item?: GalleryItem;
  fixedLink?: string;
};

function ReferenceForm({ item, fixedLink, onDone }: { item?: GalleryItem; fixedLink?: string; onDone: () => void }) {
  const [state, action, pending] = useActionState(item?.id ? updateReference.bind(null, item.id) : createReference, null);
  const [options, setOptions] = useState<LinkOptions | null>(null);
  const [optionsFailed, setOptionsFailed] = useState(false);
  const error = (name: string) => state?.errors?.[name]?.[0];
  const selected = item?.links?.map((link) => `${link.type}:${link.slug}`) ?? [];

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  useEffect(() => {
    if (fixedLink) return;
    fetch("/api/link-options")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(setOptions)
      .catch(() => setOptionsFailed(true));
  }, [fixedLink]);

  return (
    <Form action={action} className="grid gap-4 sm:grid-cols-2">
      <TextField label="Título" name="title" defaultValue={item?.title} required error={error("title")} />
      <TextField label="Crédito (opcional)" name="credit" defaultValue={item?.credit ?? ""} error={error("credit")} />
      <div className="sm:col-span-2">
        <TextAreaField label="Descrição (opcional)" name="description" rows={3} defaultValue={item?.description ?? ""} error={error("description")} />
      </div>
      {!item && (
        <>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-text-muted">Imagem (arquivo, até 5 MB)</span>
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-sm" />
            {error("image") && <span className="block text-xs text-danger" role="alert">{error("image")}</span>}
          </label>
          <TextField label="ou URL da imagem" name="image_url" type="url" placeholder="https://" error={error("image_url")} />
        </>
      )}
      <div className="sm:col-span-2">
        <TextField label="URL da fonte (opcional)" name="source_url" type="url" defaultValue={item?.source_url ?? ""} placeholder="https://" error={error("source_url")} />
      </div>

      {fixedLink && <input type="hidden" name="links" value={fixedLink} />}
      {!fixedLink && (
        <div className="space-y-4 sm:col-span-2">
          {!options && !optionsFailed && <p className="text-xs text-text-muted">Carregando opções de vínculo…</p>}
          {optionsFailed && <p className="text-xs text-danger" role="alert">Não foi possível carregar os conteúdos para vincular.</p>}
          {options && (
            <>
              <ChipCheckboxes legend="Vincular a estilos" name="links" options={options.styles} selected={selected} emptyMessage="Você ainda não criou estilos." />
              <ChipCheckboxes legend="Vincular a pessoas" name="links" options={options.people} selected={selected} emptyMessage="Você ainda não criou pessoas." />
              <ChipCheckboxes legend="Vincular a estratégias" name="links" options={options.strategies} selected={selected} emptyMessage="Você ainda não criou estratégias." />
            </>
          )}
        </div>
      )}

      {state?.message && !state.success && Object.keys(state.errors ?? {}).length === 0 && (
        <p role="alert" className="text-sm text-danger sm:col-span-2">{state.message}</p>
      )}
      <div className="flex justify-end gap-3 sm:col-span-2">
        <Button type="button" variant="secondary" onClick={onDone}>Cancelar</Button>
        <Button type="submit" disabled={pending}>{pending ? "Salvando…" : item ? "Salvar" : "Adicionar"}</Button>
      </div>
    </Form>
  );
}

export function ReferenceModal({ open, onClose, item, fixedLink }: ReferenceModalProps) {
  const [tab, setTab] = useState<"upload" | "existing">("upload");
  const showTabs = Boolean(fixedLink) && !item;
  const [type, slug] = (fixedLink ?? "").split(":");

  const tabClass = (active: boolean) =>
    `-mb-px border-b-2 pb-2 text-sm ${active ? "border-primary text-text" : "border-transparent text-text-muted hover:text-text"}`;

  return (
    <Modal open={open} onClose={onClose} title={item ? "Editar referência" : "Adicionar referência"} size="md">
      {showTabs && (
        <div role="tablist" aria-label="Origem da imagem" className="mb-5 flex gap-6 border-b border-border">
          <button type="button" role="tab" aria-selected={tab === "upload"} onClick={() => setTab("upload")} className={tabClass(tab === "upload")}>Enviar nova imagem</button>
          <button type="button" role="tab" aria-selected={tab === "existing"} onClick={() => setTab("existing")} className={tabClass(tab === "existing")}>Vincular imagem existente</button>
        </div>
      )}
      {showTabs && tab === "existing" ? (
        <LinkExistingPanel type={type as "style" | "person" | "strategy"} slug={slug} onDone={onClose} />
      ) : (
        <ReferenceForm item={item} fixedLink={fixedLink} onDone={onClose} />
      )}
    </Modal>
  );
}
