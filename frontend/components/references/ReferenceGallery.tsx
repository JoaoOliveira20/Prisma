"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { removeReference } from "@/app/actions/references";
import { FadeImage } from "@/components/content/FadeImage";
import { FavoriteButton } from "@/components/content/FavoriteButton";
import { GroupModal } from "@/components/content/GroupModal";
import { Button } from "@/components/ui/Button";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/ActionMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptySection } from "@/components/ui/EmptySection";
import { contentPaths, galleryKindLabels } from "@/lib/content";
import type { ContentType, GalleryItem, Group } from "@/types/api";
import { LinkReferencesModal } from "./LinkReferencesModal";
import { ReferenceModal } from "./ReferenceModal";
import { TagChips } from "./TagChips";

type ReferenceGalleryProps = {
  items: GalleryItem[];
  groups: Group[];
  emptyMessage?: string;
  selectable?: boolean;
};

const cardEyebrow = (item: GalleryItem) =>
  item.kind === "reference" ? (item.links ?? []).slice(0, 2).map((link) => link.name).join(" · ") || galleryKindLabels.reference : galleryKindLabels[item.kind];

export function ReferenceGallery({ items, groups, emptyMessage = "Nenhuma imagem encontrada.", selectable = false }: ReferenceGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [groupTargetKey, setGroupTargetKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return <EmptySection message={emptyMessage} />;
  }

  const canPick = (item: GalleryItem) => item.kind === "reference" && item.can.update && item.id !== null;
  const hasPickable = selectable && items.some(canPick);

  const open = (item: GalleryItem) => {
    if (selecting) {
      if (canPick(item)) setPicked((current) => (current.includes(item.id!) ? current.filter((id) => id !== item.id) : [...current, item.id!]));
      return;
    }
    setSelected(item);
    dialogRef.current?.showModal();
  };

  const stopSelecting = () => {
    setSelecting(false);
    setPicked([]);
  };

  const isReference = selected?.kind === "reference";
  const menuItems: ActionMenuItem[] = [{ label: "Salvar em grupo", onSelect: () => setGroupsOpen(true) }];
  if (selected?.can.update) menuItems.push({ label: "Editar", onSelect: () => setEditOpen(true) }, { label: "Vincular a…", onSelect: () => setLinkOpen(true) });
  if (selected?.can.delete) menuItems.push({ label: "Remover", danger: true, onSelect: () => setConfirmOpen(true) });

  const groupTarget = groupTargetKey ? items.find((item) => item.key === groupTargetKey) : undefined;
  const current = selected && items.find((item) => item.key === selected.key);
  const shown = current ?? selected;
  const position = shown ? items.findIndex((item) => item.key === shown.key) : -1;

  const step = (delta: number) => {
    const next = items[(position + delta + items.length) % items.length];
    if (next) setSelected(next);
  };

  return (
    <>
      {hasPickable && (
        <div className={`flex flex-wrap items-center justify-between gap-4 text-sm ${selecting ? "sticky top-14 z-10 mb-8 border-y border-border bg-background/95 py-3 lg:top-0" : "mb-6"}`} role="toolbar" aria-label="Seleção de imagens">
          {selecting ? (
            <>
              <p aria-live="polite" className="tabular text-text-muted">{picked.length === 0 ? "Escolha as imagens suas que quer vincular." : `${picked.length} ${picked.length === 1 ? "selecionada" : "selecionadas"}`}</p>
              <div className="flex items-center gap-3">
                <Button type="button" onClick={() => setLinkOpen(true)} disabled={picked.length === 0}>Vincular a…</Button>
                <Button type="button" variant="secondary" onClick={stopSelecting}>Cancelar</Button>
              </div>
            </>
          ) : (
            <>
              <span />
              <button type="button" onClick={() => setSelecting(true)} className="nav-link font-medium">Selecionar imagens</button>
            </>
          )}
        </div>
      )}
      <ul className="columns-2 gap-x-4 md:columns-3 md:gap-x-6 xl:columns-4 2xl:columns-5">
        {items.map((item) => {
          const pickable = canPick(item);
          const isPicked = item.id !== null && picked.includes(item.id) && item.kind === "reference";
          return (
            <li key={item.key} className="group reveal mb-8 break-inside-avoid">
              <article className={`relative transition-opacity duration-300 ${selecting && !pickable ? "opacity-40" : ""}`}>
                <button
                  type="button"
                  onClick={() => open(item)}
                  aria-label={selecting ? `Selecionar ${item.title}` : `Ampliar ${item.title}`}
                  aria-pressed={selecting && pickable ? isPicked : undefined}
                  disabled={selecting && !pickable}
                  className={`relative block w-full overflow-hidden bg-surface ${selecting ? "cursor-pointer" : "cursor-zoom-in"} ${isPicked ? "outline outline-2 outline-offset-2 outline-text" : ""}`}
                >
                  <FadeImage
                    src={item.image_url}
                    alt={item.title}
                    width={600}
                    height={600}
                    unoptimized
                    sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
                    className="h-auto w-full transition-[transform,opacity] duration-700 ease-[var(--ease-out)] group-hover:scale-[1.02]"
                  />
                  {item.tags && item.tags.length > 0 && (
                    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-10 text-left text-[11px] leading-snug text-white opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:hidden">
                      {item.tags.slice(0, 3).map((tag) => tag.name).join(" · ")}
                    </span>
                  )}
                </button>
                {selecting && pickable && (
                  <span aria-hidden="true" className={`absolute left-2.5 top-2.5 grid size-6 place-items-center border text-xs ${isPicked ? "border-text bg-text text-background" : "border-text bg-background/90"}`}>
                    {isPicked && "✓"}
                  </span>
                )}
                {!selecting && item.kind === "reference" && item.id !== null && (
                  <div className="absolute right-2.5 top-2.5 flex gap-1.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100 has-[[aria-pressed=true]]:opacity-100 [@media(hover:none)]:opacity-100">
                    <FavoriteButton type="reference" slug={String(item.id)} isFavorite={item.is_favorite ?? false} />
                    <button
                      type="button"
                      onClick={() => setGroupTargetKey(item.key)}
                      aria-label={`Salvar ${item.title} em grupo`}
                      className="grid size-9 place-items-center rounded-full bg-surface-raised/95 text-text transition duration-200 hover:scale-105 hover:bg-surface-raised active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM12 11v5M9.5 13.5h5" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="mt-2.5 space-y-0.5">
                  <p className="eyebrow truncate">{cardEyebrow(item)}</p>
                  <Link href={item.kind === "reference" && item.id !== null ? `/referencias/${item.id}` : item.slug ? `${contentPaths[item.kind as ContentType]}/${item.slug}` : "#"} className="block truncate font-serif text-lg leading-snug underline-offset-4 hover:underline">
                    {item.title}
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
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
              <FadeImage key={shown.key} src={shown.image_url} alt={shown.title} width={1600} height={1200} unoptimized className="max-h-[70vh] w-full object-contain" />
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
                <TagChips tags={shown.tags} tone="night" />
                {shown.credit && <p className="text-xs text-night-muted">Crédito: {shown.credit}</p>}
                {shown.source_url && (
                  <a href={shown.source_url} target="_blank" rel="noopener noreferrer" className="block text-xs underline">
                    Ver fonte
                  </a>
                )}
                {shown.kind === "reference" && shown.id !== null && (
                  <Link href={`/referencias/${shown.id}`} className="inline-block text-sm underline">
                    Abrir página da referência
                  </Link>
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

      {groupTarget && groupTarget.id !== null && (
        <GroupModal open onClose={() => setGroupTargetKey(null)} type="reference" slug={String(groupTarget.id)} groups={groups} groupIds={groupTarget.group_ids ?? []} />
      )}

      <LinkReferencesModal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        onLinked={() => {
          setLinkOpen(false);
          stopSelecting();
        }}
        referenceIds={selecting ? picked : shown?.id != null ? [shown.id] : []}
      />

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
