"use client";

import { useEffect, useRef } from "react";
import type { Tag } from "@/types/api";

type TagFilterProps = {
  tags: Pick<Tag, "slug" | "name">[];
  active?: string;
  onChange: (slug?: string) => void;
};

export function TagFilter({ tags, active, onChange }: TagFilterProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }, [active]);

  return (
    <div role="group" aria-label="Filtrar por tag" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [mask-image:linear-gradient(to_right,transparent,#000_12px,#000_calc(100%-24px),transparent)] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:[mask-image:none]">
      {tags.map((tag) => {
        const selected = tag.slug === active;
        return (
          <button
            key={tag.slug}
            ref={selected ? activeRef : undefined}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? undefined : tag.slug)}
            className={`flex h-10 shrink-0 items-center gap-1.5 rounded-sm border px-3 text-sm transition-colors duration-200 sm:h-8 sm:text-[13px] ${
              selected ? "border-text bg-text text-background" : "border-border text-text-muted hover:border-border-strong hover:text-text"
            }`}
          >
            {tag.name}
            {selected && (
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
