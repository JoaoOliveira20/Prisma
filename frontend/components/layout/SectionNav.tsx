"use client";

import { useEffect, useState } from "react";

type SectionNavProps = {
  sections: { id: string; label: string; count?: number }[];
};

export function SectionNav({ sections }: SectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

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

  return (
    <nav aria-label="Dimensões deste conteúdo" className="sticky top-14 z-10 border-y border-border bg-background/95 lg:top-0">
      <ul className="page-x flex gap-8 overflow-x-auto py-3.5 text-sm [scrollbar-width:none]">
        {sections.map((section) => (
          <li key={section.id} className="shrink-0">
            <a
              href={`#${section.id}`}
              aria-current={activeId === section.id ? "location" : undefined}
              className={`underline-offset-[10px] transition-colors ${activeId === section.id ? "text-text underline decoration-2" : "text-text-muted hover:text-text"}`}
            >
              {section.label}
              {section.count !== undefined && <span className="tabular ml-1.5 text-xs text-text-muted">{section.count}</span>}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
