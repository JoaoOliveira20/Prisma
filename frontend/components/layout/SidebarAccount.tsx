"use client";

import { logout } from "@/app/actions/auth";
import type { User } from "@/types/api";
import { itemRowClass, labelClass, tipFor, type RailTip } from "./SidebarItem";
import { NavIcon } from "./NavIcon";

type SidebarAccountProps = {
  user: User;
  collapsed: boolean;
  onTip: (tip: RailTip | null) => void;
};

export function SidebarAccount({ user, collapsed, onTip }: SidebarAccountProps) {
  const tip = collapsed ? tipFor("Sair", onTip) : {};
  const nameTip = collapsed ? tipFor(user.name, onTip) : {};

  return (
    <div role="group" aria-label="Conta" className={`border-t border-sidebar-border px-4 pb-4 pt-3 transition-[padding] duration-300 lg:px-6 ${collapsed ? "lg:px-3" : ""}`}>
      <div className={`flex h-12 items-center gap-3 ${collapsed ? "lg:justify-center" : ""}`} {...nameTip}>
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full border border-sidebar-border font-serif text-sm">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <p className={`min-w-0 truncate font-serif text-base transition-[opacity,max-width] duration-300 ease-[var(--ease-out)] ${collapsed ? "lg:max-w-0 lg:opacity-0" : "max-w-40"}`}>{user.name}</p>
      </div>
      <form action={logout}>
        <button type="submit" className={`${itemRowClass(collapsed)} w-[calc(100%+1.5rem)] text-sm text-sidebar-muted hover:bg-sidebar-raised/70 hover:text-sidebar-text ${collapsed ? "lg:w-full" : ""}`} {...tip}>
          <NavIcon name="logout" />
          <span className={labelClass(collapsed)}>Sair</span>
        </button>
      </form>
    </div>
  );
}
