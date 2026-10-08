"use client";

import { NavIcon } from "@/components/layout/NavIcon";

export const OPEN_SEARCH_EVENT = "prisma:open-search";

const openSearch = () => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));

export function SidebarSearchTrigger({ collapsed }: { collapsed: boolean }) {
  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Buscar em tudo"
      className={`flex h-10 w-full items-center gap-3 rounded-sm border border-sidebar-border px-3 text-sm text-sidebar-muted transition-colors hover:border-sidebar-muted hover:text-sidebar-text ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
    >
      <NavIcon name="search" />
      <span className={`flex-1 text-left ${collapsed ? "lg:hidden" : ""}`}>Buscar</span>
      <kbd className={`rounded-sm border border-sidebar-border px-1.5 text-[10px] ${collapsed ? "lg:hidden" : "hidden sm:inline"}`}>Ctrl K</kbd>
    </button>
  );
}

export function MobileSearchButton() {
  return (
    <button type="button" onClick={openSearch} aria-label="Buscar em tudo" className="grid size-10 place-items-center rounded-sm text-sidebar-text hover:bg-sidebar-raised">
      <NavIcon name="search" />
    </button>
  );
}
