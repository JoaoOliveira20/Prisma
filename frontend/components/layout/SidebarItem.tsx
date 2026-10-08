"use client";

import Link from "next/link";
import type { FocusEvent, MouseEvent } from "react";
import type { NavigationItem } from "@/lib/navigation";
import { NavIcon } from "./NavIcon";

export type RailTip = { label: string; top: number };

type SidebarItemProps = {
  item: NavigationItem;
  state: "current" | "ancestor" | null;
  collapsed: boolean;
  onNavigate: () => void;
  onTip: (tip: RailTip | null) => void;
};

export const itemRowClass = (collapsed: boolean) =>
  `group relative -mx-3 flex h-12 items-center rounded-sm px-3 transition-colors duration-200 focus-visible:outline-offset-[-2px] lg:h-10 ${
    collapsed ? "lg:mx-0 lg:justify-center lg:px-0" : ""
  }`;

export const labelClass = (collapsed: boolean) =>
  `ml-3 max-w-40 overflow-hidden whitespace-nowrap transition-[opacity,max-width,margin] duration-300 ease-[var(--ease-out)] ${collapsed ? "lg:ml-0 lg:max-w-0 lg:opacity-0" : ""}`;

export const tipFor = (label: string, onTip: (tip: RailTip | null) => void) => ({
  onMouseEnter: (event: MouseEvent<HTMLElement>) => showTip(event.currentTarget, label, onTip),
  onFocus: (event: FocusEvent<HTMLElement>) => event.currentTarget.matches(":focus-visible") && showTip(event.currentTarget, label, onTip),
  onMouseLeave: () => onTip(null),
  onBlur: () => onTip(null),
});

function showTip(element: HTMLElement, label: string, onTip: (tip: RailTip | null) => void) {
  const rect = element.getBoundingClientRect();
  onTip({ label, top: rect.top + rect.height / 2 });
}

export function SidebarItem({ item, state, collapsed, onNavigate, onTip }: SidebarItemProps) {
  const active = state !== null;
  const tip = collapsed ? tipFor(item.label, onTip) : {};

  return (
    <Link
      href={item.href}
      onClick={() => {
        onTip(null);
        onNavigate();
      }}
      aria-current={state === "current" ? "page" : state === "ancestor" ? "true" : undefined}
      className={`${itemRowClass(collapsed)} ${active ? "text-sidebar-text" : "text-sidebar-muted hover:bg-sidebar-raised/70 hover:text-sidebar-text"}`}
      {...tip}
    >
      <span
        aria-hidden="true"
        className={`absolute -left-1 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-gradient-to-b from-[#6b7bd6] via-[#79c29a] to-[#cf5a3f] transition-[transform,opacity] duration-300 ease-[var(--ease-out)] lg:-left-3 ${
          active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 group-hover:scale-y-[0.4] group-hover:opacity-50"
        }`}
      />
      <NavIcon name={item.icon} />
      <span className={`${labelClass(collapsed)} font-serif text-xl leading-none lg:font-sans lg:text-sm ${active ? "lg:font-serif lg:text-[1.0625rem]" : ""}`}>{item.label}</span>
    </Link>
  );
}
