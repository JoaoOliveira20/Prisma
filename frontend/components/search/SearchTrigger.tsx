"use client";

import { useSyncExternalStore } from "react";
import { NavIcon } from "@/components/layout/NavIcon";
import { tipFor, type RailTip } from "@/components/layout/SidebarItem";

export const OPEN_SEARCH_EVENT = "prisma:open-search";

const openSearch = () => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));

export function SidebarSearchTrigger({ collapsed, onTip }: { collapsed: boolean; onTip: (tip: RailTip | null) => void }) {
  const shortcut = useSyncExternalStore(
    () => () => {},
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K"),
    () => "Ctrl K",
  );

  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Buscar em tudo"
      aria-keyshortcuts="Control+K Meta+K"
      className={`flex h-12 w-full items-center rounded-sm border border-sidebar-border px-3 text-sm text-sidebar-muted transition-colors duration-200 hover:border-sidebar-muted hover:text-sidebar-text lg:h-10 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
      {...(collapsed ? tipFor("Buscar (Ctrl K)", onTip) : {})}
    >
      <NavIcon name="search" />
      <span className={`ml-3 flex-1 overflow-hidden whitespace-nowrap text-left transition-[opacity,max-width,margin] duration-300 ease-[var(--ease-out)] ${collapsed ? "lg:ml-0 lg:max-w-0 lg:flex-none lg:opacity-0" : "max-w-40"}`}>Buscar</span>
      <kbd className={`rounded-sm border border-sidebar-border px-1.5 text-[10px] transition-opacity duration-300 ${collapsed ? "lg:hidden" : "hidden sm:inline"}`}>{shortcut}</kbd>
    </button>
  );
}

export function MobileSearchButton() {
  return (
    <button type="button" onClick={openSearch} aria-label="Buscar em tudo" className="grid size-11 place-items-center rounded-sm text-sidebar-text transition-colors duration-200 hover:bg-sidebar-raised">
      <NavIcon name="search" />
    </button>
  );
}
