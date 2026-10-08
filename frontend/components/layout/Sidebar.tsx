"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { MobileSearchButton, SidebarSearchTrigger } from "@/components/search/SearchTrigger";
import { navigationGroups } from "@/lib/navigation";
import type { User } from "@/types/api";
import { NavIcon } from "./NavIcon";
import { SidebarAccount } from "./SidebarAccount";
import { SidebarItem, type RailTip } from "./SidebarItem";

const COLLAPSED_COOKIE = "prisma_sidebar";

type SidebarProps = {
  user: User;
  initialCollapsed: boolean;
};

export function Sidebar({ user, initialCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tip, setTip] = useState<RailTip | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      menuButtonRef.current?.focus();
    };
    const content = document.getElementById("conteudo");
    content?.setAttribute("inert", "");
    document.documentElement.style.overflow = "hidden";
    const focusTimer = setTimeout(() => drawerRef.current?.querySelector<HTMLElement>("nav a")?.focus(), 60);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      clearTimeout(focusTimer);
      content?.removeAttribute("inert");
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    setTip(null);
    document.cookie = `${COLLAPSED_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
  };

  const stateOf = (href: string) => {
    if (href === "/") return pathname === "/" ? "current" : null;
    if (pathname === href) return "current";
    return pathname.startsWith(`${href}/`) ? "ancestor" : null;
  };

  return (
    <>
      <header className="night-scope sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-2 text-sidebar-text lg:hidden">
        <Link href="/" aria-label="PRISMA, início" className="rounded-sm">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <MobileSearchButton />
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            aria-controls="sidebar"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid size-11 place-items-center rounded-sm transition-colors duration-200 hover:bg-sidebar-raised"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 8h16" className={`origin-center transition-transform duration-300 ease-[var(--ease-out)] ${mobileOpen ? "translate-y-1 rotate-45" : ""}`} style={{ transformBox: "fill-box" }} />
              <path d="M4 16h16" className={`origin-center transition-transform duration-300 ease-[var(--ease-out)] ${mobileOpen ? "-translate-y-1 -rotate-45" : ""}`} style={{ transformBox: "fill-box" }} />
            </svg>
          </button>
        </div>
      </header>

      <aside
        id="sidebar"
        ref={drawerRef}
        className={`night-scope fixed inset-x-0 bottom-0 top-[3.5rem] z-20 flex flex-col overflow-y-auto bg-sidebar text-sidebar-text transition-[opacity,translate,visibility] duration-300 ease-[var(--ease-out)] lg:visible lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-y-0 lg:overflow-x-hidden lg:border-r lg:border-sidebar-border lg:opacity-100 lg:transition-[width] ${
          mobileOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
        } ${collapsed ? "lg:w-[4.5rem]" : "lg:w-64"}`}
      >
        <div className={`hidden shrink-0 items-center px-6 pb-6 pt-7 transition-[padding] duration-300 lg:flex ${collapsed ? "lg:flex-col lg:gap-3 lg:px-0" : "justify-between"}`}>
          <Link href="/" aria-label="PRISMA, início" className="rounded-sm">
            <Logo showWordmark={!collapsed} />
          </Link>
          <button
            type="button"
            aria-label={collapsed ? "Expandir menu" : "Minimizar menu"}
            aria-expanded={!collapsed}
            aria-controls="sidebar"
            onClick={toggleCollapsed}
            className="grid size-8 place-items-center rounded-sm text-sidebar-muted transition-colors duration-200 hover:bg-sidebar-raised/70 hover:text-sidebar-text"
          >
            <span className={`transition-transform duration-300 ease-[var(--ease-out)] ${collapsed ? "rotate-180" : ""}`}>
              <NavIcon name="chevron" />
            </span>
          </button>
        </div>

        <div className={`px-4 pt-4 transition-[padding] duration-300 lg:px-6 lg:pt-0 ${collapsed ? "lg:px-3" : ""}`}>
          <SidebarSearchTrigger collapsed={collapsed} onTip={setTip} />
        </div>

        <nav aria-label="Principal" className={`mt-7 flex-1 px-4 pb-6 transition-[padding] duration-300 lg:px-6 ${collapsed ? "lg:px-3" : ""}`}>
          {navigationGroups.map((group, index) => (
            <div key={group.label ?? "entrada"} className={`${index > 0 ? "mt-7" : ""} ${collapsed && index > 0 ? "lg:border-t lg:border-sidebar-border lg:pt-5" : "border-t border-transparent"} transition-[border-color,padding] duration-300`}>
              {group.label && (
                <p className={`eyebrow mb-2 h-4 overflow-hidden whitespace-nowrap !text-sidebar-muted transition-[opacity,height,margin] duration-300 ${collapsed ? "lg:mb-0 lg:h-0 lg:opacity-0" : ""}`}>{group.label}</p>
              )}
              <ul>
                {group.items.map((item) => (
                  <li key={item.href}>
                    <SidebarItem item={item} state={stateOf(item.href)} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} onTip={setTip} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <SidebarAccount user={user} collapsed={collapsed} onTip={setTip} />
      </aside>

      {tip && (
        <div aria-hidden="true" className="night-scope menu-in pointer-events-none fixed left-[5.25rem] z-40 hidden -translate-y-1/2 whitespace-nowrap rounded-sm border border-sidebar-border bg-sidebar-raised px-2.5 py-1.5 text-xs text-sidebar-text shadow-lg lg:block" style={{ top: tip.top }}>
          {tip.label}
        </div>
      )}
    </>
  );
}
