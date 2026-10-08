"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export type ActionMenuItem = {
  label: string;
  href?: string;
  onSelect?: () => void;
  danger?: boolean;
};

export function ActionMenu({ items, label = "Mais ações" }: { items: ActionMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const close = (event: Event) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const entries = Array.from(containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
        const current = entries.indexOf(document.activeElement as HTMLElement);
        const next = event.key === "ArrowDown" ? current + 1 : current - 1;
        entries[(next + entries.length) % entries.length]?.focus();
      }
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKeyDown);
    containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const itemClass = (danger?: boolean) =>
    `block w-full rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-surface focus:bg-surface focus:outline-none ${danger ? "text-danger" : ""}`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        className="grid size-9 place-items-center rounded-full border border-border-strong bg-transparent transition-colors duration-200 hover:bg-current/10"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      {open && (
        <div id={menuId} role="menu" className="menu-in absolute right-0 z-20 mt-2 w-52 rounded-sm border border-border-strong bg-surface-raised p-1 text-text shadow-lg">
          {items.map((item) =>
            item.href ? (
              <Link key={item.label} href={item.href} role="menuitem" className={itemClass(item.danger)} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={itemClass(item.danger)}
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
