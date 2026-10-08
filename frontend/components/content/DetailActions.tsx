"use client";

import { useState, useTransition } from "react";
import { deleteContent } from "@/app/actions/content";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/ActionMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { ContentType, Group } from "@/types/api";
import { FavoriteButton } from "./FavoriteButton";
import { GroupModal } from "./GroupModal";

type DetailActionsProps = {
  type: ContentType;
  slug: string;
  name: string;
  editHref: string;
  isFavorite: boolean;
  groupIds: number[];
  groups: Group[];
  canUpdate: boolean;
  canDelete: boolean;
};

export function DetailActions({ type, slug, name, editHref, isFavorite, groupIds, groups, canUpdate, canDelete }: DetailActionsProps) {
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const items: ActionMenuItem[] = [{ label: "Salvar em grupo", onSelect: () => setGroupsOpen(true) }];
  if (canUpdate) items.push({ label: "Editar", href: editHref });
  if (canDelete) items.push({ label: "Excluir", danger: true, onSelect: () => setConfirmOpen(true) });

  return (
    <div className="flex items-center gap-2">
      <FavoriteButton type={type} slug={slug} isFavorite={isFavorite} className="size-9 border border-border" />
      <ActionMenu items={items} />
      <GroupModal open={groupsOpen} onClose={() => setGroupsOpen(false)} type={type} slug={slug} groups={groups} groupIds={groupIds} />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Excluir "${name}"?`}
        message="Esta ação não pode ser desfeita. Vínculos e itens de grupo deste conteúdo também serão removidos."
        pending={pending}
        onConfirm={() => startTransition(() => deleteContent(type, slug))}
      />
    </div>
  );
}
