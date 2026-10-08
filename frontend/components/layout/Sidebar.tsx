"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/brand/Logo";
import { MobileSearchButton, SidebarSearchTrigger } from "@/components/search/SearchTrigger";
import { navigationGroups } from "@/lib/navigation";
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
      <header className="night-scope sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-2 text-sidebar-text lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <MobileSearchButton />
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-sm hover:bg-sidebar-raised"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>
      </header>

      <aside
        className={`night-scope ${mobileOpen ? "flex" : "hidden"} fixed inset-x-0 top-[3.5rem] bottom-0 z-20 flex-col overflow-y-auto bg-sidebar text-sidebar-text lg:sticky lg:top-0 lg:flex lg:h-screen lg:shrink-0 lg:border-r lg:border-sidebar-border ${
          collapsed ? "lg:w-[4.5rem]" : "lg:w-64"
        }`}
      >
        <div className={`hidden items-center px-6 pb-8 pt-8 lg:flex ${collapsed ? "justify-center px-0" : "justify-between"}`}>
          <Logo showWordmark={!collapsed} />
          {!collapsed && (
            <button type="button" aria-label="Minimizar menu" onClick={() => setCollapsed(true)} className="rounded-sm p-1 text-sidebar-muted hover:text-sidebar-text">
              «
            </button>
          )}
        </div>
        {collapsed && (
          <button type="button" aria-label="Expandir menu" onClick={() => setCollapsed(false)} className="mx-auto mb-4 hidden rounded-sm p-1 text-sidebar-muted hover:text-sidebar-text lg:block">
            »
          </button>
        )}

        <div className={`px-4 pt-4 lg:pt-0 ${collapsed ? "lg:px-3" : "lg:px-6"}`}>
          <SidebarSearchTrigger collapsed={collapsed} />
        </div>

        <nav aria-label="Principal" className={`mt-8 flex-1 space-y-7 px-4 pb-6 ${collapsed ? "lg:px-3" : "lg:px-6"}`}>
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className={`eyebrow mb-2 !text-sidebar-muted ${collapsed ? "lg:sr-only" : ""}`}>{group.label}</p>
              <ul>
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={`relative flex h-10 items-center gap-3 text-sm transition-colors ${collapsed ? "lg:justify-center" : ""} ${
                          active ? "text-sidebar-text" : "text-sidebar-muted hover:text-sidebar-text"
                        }`}
                      >
                        {active && <span aria-hidden="true" className="absolute -left-3 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-gradient-to-b from-[#6b7bd6] via-[#79c29a] to-[#cf5a3f]" />}
                        <NavIcon name={item.icon} />
                        <span className={collapsed ? "lg:sr-only" : ""}>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className={`border-t border-sidebar-border px-6 py-5 ${collapsed ? "lg:px-0 lg:text-center" : ""}`}>
          <p className={`truncate font-serif text-base ${collapsed ? "lg:hidden" : ""}`}>{user.name}</p>
          <form action={logout}>
            <button type="submit" className={`text-xs text-sidebar-muted hover:text-sidebar-text ${collapsed ? "lg:hidden" : "mt-0.5"}`}>
              Sair
            </button>
          </form>
          {collapsed && (
            <span className="hidden size-8 place-items-center rounded-full border border-sidebar-border text-xs lg:inline-grid" aria-hidden="true">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </aside>
    </>
  );
}
