"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type AnimationEvent, type KeyboardEvent } from "react";
import { matchCommands, type PaletteGroup, type PaletteItem } from "@/lib/commands";
import { CommandResults } from "./CommandResults";
import { OPEN_SEARCH_EVENT } from "./SearchTrigger";

type ApiGroup = {
  label: string;
  items: { href: string; name: string; subtitle: string | null; imageUrl: string | null }[];
};

type SearchState = { status: "idle" | "loading" | "error" | "done"; groups: PaletteGroup[] };

const footerHints = [
  { keys: "↑↓", label: "navegar" },
  { keys: "↵", label: "abrir" },
  { keys: "esc", label: "fechar" },
];

function toPaletteGroups(groups: ApiGroup[]): PaletteGroup[] {
  return groups.map((group) => ({
    label: group.label,
    items: group.items.map((item, index) => ({
      id: `${group.label}:${index}:${item.href}`,
      label: item.name,
      subtitle: item.subtitle,
      href: item.href,
      icon: null,
      imageUrl: item.imageUrl,
    })),
  }));
}

export function CommandPalette() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (index: number) => `${baseId}-option-${index}`;
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [result, setResult] = useState<SearchState>({ status: "idle", groups: [] });

  const term = query.trim();
  const groups = useMemo(() => [...matchCommands(term), ...(term === "" ? [] : result.groups)], [term, result.groups]);
  const items = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const activeIndex = Math.min(selectedIndex, Math.max(items.length - 1, 0));

  const open = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    setClosing(false);
    if (!dialog.open) dialog.showModal();
    setIsOpen(true);
  };

  const requestClose = () => {
    if (dialogRef.current?.open) setClosing(true);
  };

  const finishClose = () => {
    setClosing(false);
    dialogRef.current?.close();
  };

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
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
    if (!closing) return;
    const fallback = setTimeout(finishClose, 250);
    return () => clearTimeout(fallback);
  }, [closing]);

  useEffect(() => {
    if (term === "") return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setResult((current) => ({ ...current, status: "loading" }));
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const { groups: apiGroups }: { groups: ApiGroup[] } = await response.json();
        setResult({ status: "done", groups: toPaletteGroups(apiGroups) });
      } catch {
        if (!controller.signal.aborted) setResult({ status: "error", groups: [] });
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  const select = (item: PaletteItem) => {
    router.push(item.href);
    requestClose();
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (items.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex(activeIndex < items.length - 1 ? activeIndex + 1 : 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex(activeIndex > 0 ? activeIndex - 1 : items.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      select(items[activeIndex]);
    }
  };

  const onAnimationEnd = (event: AnimationEvent<HTMLDialogElement>) => {
    if (closing && event.target === event.currentTarget && event.pseudoElement === "") finishClose();
  };

  const searching = term !== "" && result.status === "loading";
  const failed = term !== "" && result.status === "error";
  const nothingFound = term !== "" && items.length === 0 && !searching && !failed;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Pesquisa global"
      data-closing={closing}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={() => {
        setQuery("");
        setSelectedIndex(0);
        setClosing(false);
        setIsOpen(false);
      }}
      onAnimationEnd={onAnimationEnd}
      onClick={(event) => event.target === dialogRef.current && requestClose()}
      className="command-palette m-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] overflow-hidden rounded-sm border border-border-strong bg-surface-raised p-0 text-text shadow-2xl backdrop:bg-night/60"
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={onInputKeyDown}
          placeholder="Buscar estilos, pessoas, referências ou digitar um comando…"
          aria-label="Buscar"
          role="combobox"
          aria-expanded={items.length > 0}
          aria-controls={listId}
          aria-activedescendant={items.length > 0 ? optionId(activeIndex) : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-4 font-serif text-lg outline-none placeholder:text-text-muted"
        />
        {searching && <span role="status" className="text-xs text-text-muted">Buscando…</span>}
        {query && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => {
              setQuery("");
              setSelectedIndex(0);
              inputRef.current?.focus();
            }}
            className="grid size-6 shrink-0 place-items-center rounded-sm text-text-muted hover:bg-surface hover:text-text"
          >
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && items.length > 0 && (
        <CommandResults groups={groups} selectedIndex={activeIndex} listId={listId} optionId={optionId} onSelect={select} onHover={setSelectedIndex} />
      )}
      {failed && <p role="alert" className="px-4 py-8 text-center text-sm text-danger">Não foi possível pesquisar agora.</p>}
      {nothingFound && <p className="px-4 py-8 text-center text-sm text-text-muted">Nenhum resultado para “{term}”.</p>}

      <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-text-muted">
        {footerHints.map((hint) => (
          <span key={hint.keys} className="flex items-center gap-1.5">
            <kbd className="rounded-sm border border-border bg-surface px-1.5 py-0.5 text-[10px]">{hint.keys}</kbd>
            {hint.label}
          </span>
        ))}
      </div>
    </dialog>
  );
}
