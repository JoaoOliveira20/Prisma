"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { setGroupMembership } from "@/app/actions/content";
import { Modal } from "@/components/ui/Modal";
import type { Group, GroupableType } from "@/types/api";

type GroupModalProps = {
  open: boolean;
  onClose: () => void;
  type: GroupableType;
  slug: string;
  groups: Group[];
  groupIds: number[];
};

export function GroupModal({ open, onClose, type, slug, groups, groupIds }: GroupModalProps) {
  const [, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useOptimistic(groupIds);

  const toggle = (group: Group, checked: boolean) =>
    startTransition(async () => {
      setSelectedIds(checked ? [...selectedIds, group.id] : selectedIds.filter((id) => id !== group.id));
      await setGroupMembership(group.id, type, slug, checked);
    });

  return (
    <Modal open={open} onClose={onClose} title="Salvar em grupo" size="sm">
      <ul className="space-y-1">
        {groups.map((group) => (
          <li key={group.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 text-sm hover:bg-surface">
              <input type="checkbox" checked={selectedIds.includes(group.id)} onChange={(event) => toggle(group, event.target.checked)} />
              <span className="truncate">{group.name}</span>
            </label>
          </li>
        ))}
      </ul>
      <Link href="/grupos" className="mt-4 inline-block text-xs text-text-muted underline hover:text-text">
        Gerenciar grupos
      </Link>
    </Modal>
  );
}
