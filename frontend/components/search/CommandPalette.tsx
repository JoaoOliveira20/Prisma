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
  const [attempt, setAttempt] = useState(0);

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
  }, [term, attempt]);

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
      className="command-palette m-auto mt-3 w-[min(46rem,calc(100vw-1.5rem))] overflow-hidden rounded-sm border border-border-strong bg-surface-raised p-0 text-text shadow-[0_28px_70px_-28px_rgba(7,8,11,0.55)] backdrop:bg-night/55 sm:mt-[10vh]"
    >
      <div className="group relative flex items-center gap-3 border-b border-border px-4 sm:px-5">
        <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-text-muted" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
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
          placeholder="Buscar em todo o acervo ou ir para…"
          aria-label="Buscar"
          role="combobox"
          aria-expanded={items.length > 0}
          aria-controls={listId}
          aria-activedescendant={items.length > 0 ? optionId(activeIndex) : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent py-5 font-serif text-xl outline-none placeholder:text-text-muted"
        />
        <span role="status" className="sr-only">{searching ? "Buscando…" : ""}</span>
        {query ? (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => {
              setQuery("");
              setSelectedIndex(0);
              inputRef.current?.focus();
            }}
            className="grid size-9 shrink-0 place-items-center rounded-sm text-text-muted transition-colors duration-200 hover:bg-surface hover:text-text"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        ) : (
          <kbd aria-hidden="true" className="hidden rounded-sm border border-border bg-surface px-1.5 py-0.5 text-[10px] text-text-muted sm:block">esc</kbd>
        )}
        <button type="button" onClick={requestClose} className="shrink-0 px-1 py-2 text-sm text-text-muted underline decoration-border-strong underline-offset-4 sm:hidden">
          Fechar
        </button>
        <span
          aria-hidden="true"
          className={`spectrum-gradient pointer-events-none absolute inset-x-0 -bottom-px h-0.5 origin-left transition-transform duration-300 ease-[var(--ease-out)] ${
            searching ? "palette-loading scale-x-100" : "scale-x-0 group-focus-within:scale-x-100"
          }`}
        />
      </div>

      {isOpen && items.length > 0 && (
        <CommandResults groups={groups} selectedIndex={activeIndex} listId={listId} optionId={optionId} onSelect={select} onHover={setSelectedIndex} />
      )}
      {failed && (
        <div role="alert" className="px-5 py-10 text-center">
          <p className="font-serif text-xl">Não foi possível pesquisar agora.</p>
          <p className="mt-1.5 text-sm text-text-muted">Verifique a conexão e tente de novo.</p>
          <button
            type="button"
            onClick={() => setAttempt((count) => count + 1)}
            className="mt-4 text-sm underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-text"
          >
            Tentar novamente
          </button>
        </div>
      )}
      {nothingFound && (
        <div className="results-in px-5 py-10 text-center">
          <p className="font-serif text-xl">Nenhum resultado para “{term}”.</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-text-muted">Tente outra palavra, ou busque pelo nome de um estilo, pessoa, estratégia, tag ou grupo.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedIndex(0);
              inputRef.current?.focus();
            }}
            className="mt-4 text-sm underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-text"
          >
            Limpar busca
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 border-t border-border px-5 py-2.5 text-[11px] text-text-muted">
        <span className="hidden items-center gap-4 sm:flex">
          {footerHints.filter((hint) => items.length > 0 || hint.keys === "esc").map((hint) => (
            <span key={hint.keys} className="flex items-center gap-1.5">
              <kbd className="rounded-sm border border-border bg-surface px-1.5 py-0.5 text-[10px]">{hint.keys}</kbd>
              {hint.label}
            </span>
          ))}
        </span>
        {term !== "" && items.length > 0 && (
          <span aria-live="polite" className="tabular ml-auto">{items.length} {items.length === 1 ? "resultado" : "resultados"}</span>
        )}
      </div>
    </dialog>
  );
}
