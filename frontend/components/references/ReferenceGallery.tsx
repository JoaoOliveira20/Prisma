"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { removeReference } from "@/app/actions/references";
import { FavoriteButton } from "@/components/content/FavoriteButton";
import { GroupModal } from "@/components/content/GroupModal";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/ActionMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptySection } from "@/components/ui/EmptySection";
import { contentPaths, galleryKindLabels } from "@/lib/content";
import type { GalleryItem, Group } from "@/types/api";
import { ReferenceModal } from "./ReferenceModal";

type ReferenceGalleryProps = {
  items: GalleryItem[];
  groups: Group[];
  emptyMessage?: string;
};

export function ReferenceGallery({ items, groups, emptyMessage = "Nenhuma imagem encontrada." }: ReferenceGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return <EmptySection message={emptyMessage} />;
  }

  const open = (item: GalleryItem) => {
    setSelected(item);
    dialogRef.current?.showModal();
  };

  const isReference = selected?.kind === "reference";
  const menuItems: ActionMenuItem[] = [{ label: "Salvar em grupo", onSelect: () => setGroupsOpen(true) }];
  if (selected?.can.update) menuItems.push({ label: "Editar", onSelect: () => setEditOpen(true) });
  if (selected?.can.delete) menuItems.push({ label: "Remover", danger: true, onSelect: () => setConfirmOpen(true) });

  const current = selected && items.find((item) => item.key === selected.key);
  const shown = current ?? selected;

  return (
    <>
      <ul className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {items.map((item) => (
          <li key={item.key} className="mb-5 break-inside-avoid">
            <button type="button" onClick={() => open(item)} aria-label={`Ampliar ${item.title}`} className="block w-full overflow-hidden rounded-md bg-surface">
              <Image src={item.image_url} alt={item.title} width={600} height={600} unoptimized className="h-auto w-full" />
            </button>
            <p className="mt-2 text-sm leading-tight">{item.title}</p>
            {item.description && <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">{item.description}</p>}
            {item.kind !== "reference" && <p className="mt-1 text-[11px] uppercase tracking-wider text-text-muted/80">{galleryKindLabels[item.kind]}</p>}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={shown?.title ?? "Imagem"}
        onClose={() => setSelected(null)}
        onClick={(event) => event.target === dialogRef.current && dialogRef.current.close()}
        className="m-auto max-h-[92vh] w-[min(64rem,calc(100vw-2rem))] overflow-y-auto rounded-lg bg-night p-0 text-night-text backdrop:bg-night/80"
      >
        {shown && (
          <div>
            <Image src={shown.image_url} alt={shown.title} width={1600} height={1200} unoptimized className="max-h-[70vh] w-full object-contain" />
            <div className="flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="min-w-0 space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-night-muted">{galleryKindLabels[shown.kind]}</p>
                <h3 className="font-serif text-xl">{shown.title}</h3>
                {shown.description && <p className="max-w-prose text-sm text-night-muted">{shown.description}</p>}
                {shown.credit && <p className="text-xs text-night-muted">Crédito: {shown.credit}</p>}
                {shown.source_url && (
                  <a href={shown.source_url} target="_blank" rel="noopener noreferrer" className="block text-xs underline">
                    Ver fonte
                  </a>
                )}
                {shown.kind !== "reference" && shown.slug && (
                  <Link href={`${contentPaths[shown.kind]}/${shown.slug}`} className="inline-block text-sm underline">
                    Abrir {galleryKindLabels[shown.kind].toLowerCase()}
                  </Link>
                )}
                {shown.links && shown.links.length > 0 && (
                  <ul className="flex flex-wrap gap-2 pt-1" aria-label="Conteúdos vinculados">
                    {shown.links.map((link) => (
                      <li key={`${link.type}-${link.slug}`}>
                        <Link href={`${contentPaths[link.type]}/${link.slug}`} className="rounded-full border border-night-border px-2.5 py-0.5 text-[11px] hover:bg-night-surface">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2 text-text">
                {isReference && shown.id !== null && (
                  <>
                    <FavoriteButton type="reference" slug={String(shown.id)} isFavorite={shown.is_favorite ?? false} className="size-9" />
                    <ActionMenu items={menuItems} />
                  </>
                )}
                <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-md border border-night-border px-3 py-1.5 text-xs text-night-text hover:bg-night-surface">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>

      {isReference && shown && shown.id !== null && (
        <>
          <GroupModal open={groupsOpen} onClose={() => setGroupsOpen(false)} type="reference" slug={String(shown.id)} groups={groups} groupIds={shown.group_ids ?? []} />
          <ReferenceModal open={editOpen} onClose={() => setEditOpen(false)} item={shown} />
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title={`Remover "${shown.title}"?`}
            message="A imagem será apagada da biblioteca e de todos os grupos. Esta ação não pode ser desfeita."
            confirmLabel="Remover"
            pending={pending}
            onConfirm={() =>
              startTransition(async () => {
                await removeReference(shown.id!);
                setConfirmOpen(false);
                dialogRef.current?.close();
              })
            }
          />
        </>
      )}
    </>
  );
}
