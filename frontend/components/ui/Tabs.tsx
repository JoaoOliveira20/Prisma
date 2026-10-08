"use client";

import { useState, type ReactNode } from "react";

type Tab = { id: string; label: string; content: ReactNode };

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [activeId, setActiveId] = useState(tabs[0].id);

  return (
    <div>
      <div role="tablist" aria-label="Seções" className="flex gap-6 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={activeId === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveId(tab.id)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm transition-colors ${
              activeId === tab.id ? "border-primary text-text" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} hidden={activeId !== tab.id} className="pt-6">
          {tab.content}
        </div>
      ))}
    </div>
  );
}
