"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeReference } from "@/app/actions/references";
import { FavoriteButton } from "@/components/content/FavoriteButton";
import { GroupModal } from "@/components/content/GroupModal";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/ActionMenu";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { GalleryItem, Group } from "@/types/api";
import { LinkReferencesModal } from "./LinkReferencesModal";
import { ReferenceModal } from "./ReferenceModal";

type ReferenceDetailActionsProps = {
  item: GalleryItem;
  groups: Group[];
};

export function ReferenceDetailActions({ item, groups }: ReferenceDetailActionsProps) {
  const router = useRouter();
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const id = item.id!;

  const menuItems: ActionMenuItem[] = [];
  if (item.can.update) menuItems.push({ label: "Editar", onSelect: () => setEditOpen(true) }, { label: "Vincular a…", onSelect: () => setLinkOpen(true) });
  if (item.can.delete) menuItems.push({ label: "Remover", danger: true, onSelect: () => setConfirmOpen(true) });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <FavoriteButton type="reference" slug={String(id)} isFavorite={item.is_favorite ?? false} className="size-11 border border-border-strong" />
      <Button type="button" variant="secondary" onClick={() => setGroupsOpen(true)}>Salvar em grupo</Button>
      {menuItems.length > 0 && <ActionMenu items={menuItems} />}

      <GroupModal open={groupsOpen} onClose={() => setGroupsOpen(false)} type="reference" slug={String(id)} groups={groups} groupIds={item.group_ids ?? []} />
      <ReferenceModal open={editOpen} onClose={() => setEditOpen(false)} item={item} />
      <LinkReferencesModal open={linkOpen} onClose={() => setLinkOpen(false)} onLinked={() => setLinkOpen(false)} referenceIds={[id]} />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Remover "${item.title}"?`}
        message="A imagem será apagada da biblioteca e de todos os grupos. Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        pending={pending}
        onConfirm={() =>
          startTransition(async () => {
            await removeReference(id);
            router.push("/referencias");
          })
        }
      />
    </div>
  );
}
