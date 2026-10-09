"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { CoverImage } from "@/components/content/CoverImage";
import { NavIcon } from "@/components/layout/NavIcon";
import type { PaletteGroup, PaletteItem } from "@/lib/commands";

type CommandResultsProps = {
  groups: PaletteGroup[];
  selectedIndex: number;
  listId: string;
  optionId: (index: number) => string;
  onSelect: (item: PaletteItem) => void;
  onHover: (index: number) => void;
};

type Highlight = { top: number; height: number };

export function CommandResults({ groups, selectedIndex, listId, optionId, onSelect, onHover }: CommandResultsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState<Highlight | null>(null);

  useLayoutEffect(() => {
    const selected = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!selected) {
      setHighlight(null);
      return;
    }
    selected.scrollIntoView({ block: "nearest" });
    setHighlight({ top: selected.offsetTop, height: selected.offsetHeight });
  }, [selectedIndex, groups]);

  let runningIndex = 0;

  return (
    <div ref={listRef} id={listId} role="listbox" aria-label="Resultados" className="relative max-h-[min(30rem,calc(100dvh-10rem))] overflow-y-auto overscroll-contain p-2 sm:p-3">
      {highlight && (
        <div
          aria-hidden="true"
          data-palette-highlight
          className="pointer-events-none absolute inset-x-2 top-0 rounded-sm bg-background sm:inset-x-3"
          style={{
            height: highlight.height,
            transform: `translateY(${highlight.top}px)`,
            transition: "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1), height 180ms ease",
          }}
        >
          <span className="absolute inset-y-2 left-0 w-0.5 bg-gradient-to-b from-[#6b7bd6] via-[#79c29a] to-[#cf5a3f]" />
        </div>
      )}
      {groups.map((group) => (
        <div key={group.label} role="group" aria-label={group.label}>
          <p aria-hidden="true" className="flex items-baseline justify-between px-3 pb-1.5 pt-4 text-[11px] font-medium uppercase tracking-wider text-text-muted first:pt-1">
            <span>{group.label}</span>
            <span className="tabular font-normal">{group.items.length}</span>
          </p>
          {group.items.map((item) => {
            const index = runningIndex++;
            const selected = index === selectedIndex;
            const compact = item.icon !== null;
            return (
              <div
                key={item.id}
                id={optionId(index)}
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(item)}
                onMouseMove={() => !selected && onHover(index)}
                style={{ "--i": Math.min(index, 8) } as React.CSSProperties}
                className={`result-in relative flex cursor-pointer items-center gap-3.5 rounded-sm px-3 ${compact ? "py-2" : "py-2.5"}`}
              >
                <span className={`grid shrink-0 place-items-center overflow-hidden rounded-sm bg-surface text-text-muted ${compact ? "size-8" : "size-10"}`}>
                  {item.icon ? <NavIcon name={item.icon} /> : <CoverImage name={item.label} coverUrl={item.imageUrl} className="size-10" sizes="40px" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate ${compact ? "text-sm" : "text-[15px]"} ${selected ? "text-text" : ""}`}>{item.label}</span>
                  {item.subtitle && <span className="mt-0.5 block truncate text-xs text-text-muted">{item.subtitle}</span>}
                </span>
                {selected && (
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-text-muted">
                    <span className="hidden sm:inline">Abrir</span>
                    <kbd className="rounded-sm border border-border bg-surface-raised px-1.5 py-0.5 text-[10px]">↵</kbd>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
