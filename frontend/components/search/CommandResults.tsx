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
    <div ref={listRef} id={listId} role="listbox" aria-label="Resultados" className="relative max-h-[min(24rem,50vh)] overflow-y-auto p-2">
      {highlight && (
        <div
          aria-hidden="true"
          data-palette-highlight
          className="pointer-events-none absolute inset-x-2 top-0 rounded-sm bg-background"
          style={{
            height: highlight.height,
            transform: `translateY(${highlight.top}px)`,
            transition: "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1), height 180ms ease",
          }}
        />
      )}
      {groups.map((group) => (
        <div key={group.label} role="group" aria-label={group.label}>
          <p aria-hidden="true" className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-text-muted first:pt-1">
            {group.label}
          </p>
          {group.items.map((item) => {
            const index = runningIndex++;
            const selected = index === selectedIndex;
            return (
              <div
                key={item.id}
                id={optionId(index)}
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(item)}
                onMouseMove={() => !selected && onHover(index)}
                className="relative flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2"
              >
                <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-sm bg-surface text-text-muted">
                  {item.icon ? <NavIcon name={item.icon} /> : <CoverImage name={item.label} coverUrl={item.imageUrl} className="size-9" sizes="36px" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{item.label}</span>
                  {item.subtitle && <span className="block truncate text-xs text-text-muted">{item.subtitle}</span>}
                </span>
                {selected && <kbd className="rounded-sm border border-border bg-surface-raised px-1.5 py-0.5 text-[10px] text-text-muted">↵</kbd>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
