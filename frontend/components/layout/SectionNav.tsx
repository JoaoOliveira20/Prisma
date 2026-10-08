"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";

type SectionNavProps = {
  sections: { id: string; label: string; count?: number; href?: string }[];
};

export function SectionNav({ sections }: SectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const elements = sections.flatMap((section) => document.getElementById(section.id) ?? []);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  useLayoutEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[aria-current="location"]');
    if (active) setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
  }, [activeId, sections]);

  const goTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  return (
    <nav aria-label="Dimensões deste conteúdo" className="sticky top-14 z-10 border-y border-border bg-background/95 lg:top-0">
      <ul ref={listRef} className="page-x relative flex gap-8 overflow-x-auto py-3.5 text-sm [scrollbar-width:none]">
        {sections.map((section) => (
          <li key={section.id} className="shrink-0">
            {section.href ? (
              <Link href={section.href} className="block py-1 text-text-muted transition-colors duration-200 hover:text-text">
                {section.label}
                {section.count !== undefined && <span className="tabular ml-1.5 text-xs text-text-muted">{section.count}</span>}
                <span aria-hidden="true" className="ml-1.5">→</span>
              </Link>
            ) : (
            <a
              href={`#${section.id}`}
              onClick={(event) => goTo(event, section.id)}
              aria-current={activeId === section.id ? "location" : undefined}
              className={`block py-1 transition-colors duration-200 ${activeId === section.id ? "text-text" : "text-text-muted hover:text-text"}`}
            >
              {section.label}
              {section.count !== undefined && <span className="tabular ml-1.5 text-xs text-text-muted">{section.count}</span>}
            </a>
            )}
          </li>
        ))}
        {indicator && (
          <span
            aria-hidden="true"
            className="absolute bottom-0 h-0.5 bg-text transition-[transform,width] duration-300 ease-[var(--ease-out)]"
            style={{ width: indicator.width, transform: `translateX(${indicator.left}px)`, left: 0 }}
          />
        )}
      </ul>
    </nav>
  );
}
