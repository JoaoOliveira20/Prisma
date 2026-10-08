"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/brand/Logo";
import { navigationItems } from "@/lib/navigation";
import type { User } from "@/types/api";
import { NavIcon } from "./NavIcon";

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-text md:hidden">
        <Logo />
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-md p-2 hover:bg-sidebar-raised"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>

      <aside
        className={`${mobileOpen ? "flex" : "hidden"} fixed inset-x-0 top-[3.25rem] bottom-0 z-20 flex-col bg-sidebar text-sidebar-text md:sticky md:top-0 md:flex md:h-screen md:shrink-0 md:border-r md:border-sidebar-border ${
          collapsed ? "md:w-[4.25rem]" : "md:w-60"
        }`}
      >
        <div className={`hidden items-center px-5 py-6 md:flex ${collapsed ? "justify-center px-0" : "justify-between"}`}>
          <Logo showWordmark={!collapsed} />
          {!collapsed && (
            <button type="button" aria-label="Minimizar menu" onClick={() => setCollapsed(true)} className="rounded p-1 text-sidebar-muted hover:text-sidebar-text">
              «
            </button>
          )}
        </div>
        {collapsed && (
          <button type="button" aria-label="Expandir menu" onClick={() => setCollapsed(false)} className="mx-auto mb-2 hidden rounded p-1 text-sidebar-muted hover:text-sidebar-text md:block">
            »
          </button>
        )}

        <nav aria-label="Principal" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {navigationItems.map((item) => {
            const content = (
              <>
                <NavIcon name={item.icon} />
                <span className={collapsed ? "md:sr-only" : ""}>{item.label}</span>
              </>
            );
            const layout = `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${collapsed ? "md:justify-center" : ""}`;

            if (!item.href) {
              return (
                <span key={item.label} title="Em breve" aria-disabled="true" className={`${layout} cursor-not-allowed text-sidebar-muted/50`}>
                  {content}
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`${layout} transition-colors ${
                  isActive(item.href)
                    ? "bg-sidebar-raised text-sidebar-text"
                    : "text-sidebar-muted hover:bg-sidebar-raised/60 hover:text-sidebar-text"
                }`}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        <div className={`flex items-center gap-3 border-t border-sidebar-border p-4 ${collapsed ? "md:justify-center" : ""}`}>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sidebar-raised text-xs font-medium" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className={`min-w-0 flex-1 ${collapsed ? "md:hidden" : ""}`}>
            <p className="truncate text-sm">{user.name}</p>
            <form action={logout}>
              <button type="submit" className="text-xs text-sidebar-muted hover:text-sidebar-text">
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
