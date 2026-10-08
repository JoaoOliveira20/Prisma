"use client";

export const OPEN_SEARCH_EVENT = "prisma:open-search";

export function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
      className="flex w-full max-w-xs items-center gap-2 rounded-md border border-border bg-surface-raised px-3 py-2 text-left text-sm text-text-muted hover:bg-surface"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </svg>
      <span className="flex-1 truncate">Buscar em tudo…</span>
      <kbd className="hidden rounded border border-border px-1.5 text-[10px] sm:inline">Ctrl K</kbd>
    </button>
  );
}
