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
  const position = shown ? items.findIndex((item) => item.key === shown.key) : -1;

  const step = (delta: number) => {
    const next = items[(position + delta + items.length) % items.length];
    if (next) setSelected(next);
  };

  return (
    <>
      <ul className="columns-2 gap-x-5 md:columns-3 xl:columns-4">
        {items.map((item) => (
          <li key={item.key} className="group mb-9 break-inside-avoid">
            <button type="button" onClick={() => open(item)} aria-label={`Ampliar ${item.title}`} className="block w-full overflow-hidden bg-surface">
              <Image src={item.image_url} alt={item.title} width={600} height={600} unoptimized className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]" />
            </button>
            <div className="mt-3 space-y-1">
              {item.kind !== "reference" && <p className="eyebrow">{galleryKindLabels[item.kind]}</p>}
              <p className="font-serif text-lg leading-tight">{item.title}</p>
              {item.description && <p className="line-clamp-2 text-xs leading-relaxed text-text-muted">{item.description}</p>}
            </div>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={shown?.title ?? "Imagem"}
        onClose={() => setSelected(null)}
        onKeyDown={(event) => {
          if (items.length < 2 || (event.target as HTMLElement).closest("input, textarea, [role='menu']")) return;
          if (event.key === "ArrowLeft") step(-1);
          if (event.key === "ArrowRight") step(1);
        }}
        onClick={(event) => event.target === dialogRef.current && dialogRef.current.close()}
        className="night-scope m-auto max-h-[94vh] w-[min(72rem,calc(100vw-2rem))] overflow-y-auto bg-night p-0 text-night-text backdrop:bg-night/90"
      >
        {shown && (
          <div>
            <div className="relative">
              <Image src={shown.image_url} alt={shown.title} width={1600} height={1200} unoptimized className="max-h-[70vh] w-full object-contain" />
              {items.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label="Imagem anterior" className="absolute inset-y-0 left-0 w-1/5 text-left text-3xl text-night-text/0 transition-colors hover:text-night-text focus-visible:text-night-text">
                    <span className="ml-4">←</span>
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label="Próxima imagem" className="absolute inset-y-0 right-0 w-1/5 text-right text-3xl text-night-text/0 transition-colors hover:text-night-text focus-visible:text-night-text">
                    <span className="mr-4">→</span>
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="min-w-0 space-y-2">
                <p className="eyebrow !text-night-muted">{galleryKindLabels[shown.kind]}{items.length > 1 && ` · ${position + 1} de ${items.length}`}</p>
                <h3 className="font-serif text-3xl leading-tight">{shown.title}</h3>
                {shown.description && <p className="max-w-prose text-base leading-relaxed text-night-muted">{shown.description}</p>}
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
                        <Link href={`${contentPaths[link.type]}/${link.slug}`} className="border border-night-border px-3 py-1 text-xs hover:bg-night-surface">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {isReference && shown.id !== null && (
                  <>
                    <FavoriteButton type="reference" slug={String(shown.id)} isFavorite={shown.is_favorite ?? false} className="size-9" />
                    <ActionMenu items={menuItems} />
                  </>
                )}
                <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-sm border border-night-border px-4 py-2 text-xs text-night-text hover:bg-night-surface">
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
