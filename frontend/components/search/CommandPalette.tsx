"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CoverImage } from "@/components/content/CoverImage";
import { OPEN_SEARCH_EVENT } from "./SearchTrigger";

type SearchHit = {
  href: string;
  name: string;
  subtitle: string | null;
  imageUrl: string | null;
};

type SearchGroup = { label: string; items: SearchHit[] };

type SearchState = { status: "idle" | "loading" | "error" | "done"; groups: SearchGroup[] };

export function CommandPalette() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [result, setResult] = useState<SearchState>({ status: "idle", groups: [] });

  useEffect(() => {
    const open = () => dialogRef.current?.showModal();
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, open);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, open);
    };
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term === "") {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setResult((current) => ({ ...current, status: "loading" }));
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const { groups } = await response.json();
        setActiveIndex(0);
        setResult({ status: "done", groups });
      } catch {
        if (!controller.signal.aborted) setResult({ status: "error", groups: [] });
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const visibleGroups = query.trim() === "" ? [] : result.groups;
  const visibleHits = visibleGroups.flatMap((group) => group.items);

  const go = (href: string) => {
    dialogRef.current?.close();
    router.push(href);
  };

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, visibleHits.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && visibleHits[activeIndex]) {
      go(visibleHits[activeIndex].href);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Pesquisa global"
      onClose={() => setQuery("")}
      onClick={(event) => event.target === dialogRef.current && dialogRef.current.close()}
      className="m-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface-raised p-0 text-text shadow-2xl backdrop:bg-night/60"
    >
      <input
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onInputKeyDown}
        placeholder="Buscar estilos, pessoas, referências, grupos, tags…"
        aria-label="Buscar"
        role="combobox"
        aria-expanded={visibleHits.length > 0}
        aria-controls="search-results"
        className="w-full rounded-t-xl border-b border-border bg-transparent px-4 py-3.5 text-sm outline-none"
      />
      <div className="max-h-80 overflow-y-auto p-2">
        {query.trim() === "" && <p className="px-3 py-6 text-center text-sm text-text-muted">Digite para pesquisar.</p>}
        {query.trim() !== "" && result.status === "loading" && visibleHits.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-text-muted">Buscando…</p>
        )}
        {query.trim() !== "" && result.status === "error" && (
          <p className="px-3 py-6 text-center text-sm text-danger" role="alert">Não foi possível pesquisar agora.</p>
        )}
        {query.trim() !== "" && result.status === "done" && visibleHits.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-text-muted">Nenhum resultado para “{query.trim()}”.</p>
        )}
        {visibleHits.length > 0 && (
          <div id="search-results" role="listbox">
            {visibleGroups.map((group) => (
              <div key={group.label}>
                <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-text-muted">{group.label}</p>
                <ul>
                  {group.items.map((hit) => {
                    const index = visibleHits.indexOf(hit);
                    return (
                      <li key={hit.href} role="option" aria-selected={index === activeIndex}>
                        <button
                          type="button"
                          onClick={() => go(hit.href)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left ${index === activeIndex ? "bg-surface" : ""}`}
                        >
                          <CoverImage name={hit.name} coverUrl={hit.imageUrl} className="size-10 shrink-0 rounded" />
                          <span>
                            <span className="block text-sm">{hit.name}</span>
                            {hit.subtitle && <span className="block text-xs text-text-muted">{hit.subtitle}</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}
