"use client";

import { useEffect, useId, useRef, useState } from "react";
import { contentTypeLabels } from "@/lib/content";
import type { EntityOption } from "@/types/api";

type EntityPickerProps = {
  legend: string;
  selected: EntityOption[];
  onChange: (selected: EntityOption[]) => void;
  multiple?: boolean;
  name?: string;
};

export function EntityPicker({ legend, selected, onChange, multiple = true, name }: EntityPickerProps) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<EntityOption[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLFieldSetElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/link-options?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then(({ options: found }: { options: EntityOption[] }) => {
          setOptions(found);
          setActive(0);
          setFailed(false);
        })
        .catch((error) => error?.name !== "AbortError" && setFailed(true));
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => !containerRef.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const available = options.filter((option) => !selected.some((item) => item.value === option.value));

  const choose = (option: EntityOption) => {
    onChange(multiple ? [...selected, option] : [option]);
    setQuery("");
    if (!multiple) setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (available.length > 0) setActive((current) => (current + (event.key === "ArrowDown" ? 1 : -1) + available.length) % available.length);
    }
    if (event.key === "Enter" && open && available[active]) {
      event.preventDefault();
      choose(available[active]);
    }
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <fieldset ref={containerRef} className="relative space-y-2">
      <legend className="text-sm font-medium text-text">{legend}</legend>
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Selecionados">
          {selected.map((option) => (
            <li key={option.value} className="flex items-center gap-1.5 border border-primary bg-primary py-1 pl-3 pr-1 text-xs text-primary-foreground">
              <span>{option.label}</span>
              <span className="opacity-70">{contentTypeLabels[option.type]}</span>
              <button
                type="button"
                onClick={() => onChange(selected.filter((item) => item.value !== option.value))}
                aria-label={`Remover ${option.label}`}
                className="grid size-5 place-items-center text-sm leading-none hover:bg-primary-foreground/20"
              >
                ×
              </button>
              {name && <input type="hidden" name={name} value={option.value} />}
            </li>
          ))}
        </ul>
      )}
      <input
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={open && available.length > 0 ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={open && available[active] ? `${listId}-${active}` : undefined}
        aria-label={`Buscar ${legend.toLowerCase()}`}
        value={query}
        placeholder="Buscar estilo, pessoa ou estratégia"
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-10 w-full rounded-sm border border-border-strong bg-transparent px-3 text-sm placeholder:text-text-muted focus:border-text"
      />
      {open && available.length === 0 && (
        <p role="status" className={`menu-in absolute inset-x-0 z-20 border border-border-strong bg-surface-raised px-3 py-2 text-xs ${failed ? "text-danger" : "text-text-muted"}`}>
          {failed ? "Não foi possível carregar os conteúdos." : "Nenhum conteúdo seu encontrado."}
        </p>
      )}
      {open && available.length > 0 && (
        <ul id={listId} role="listbox" aria-label="Resultados" className="menu-in absolute inset-x-0 z-20 max-h-60 overflow-y-auto border border-border-strong bg-surface-raised p-1 shadow-lg">
          {available.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
              className={`flex cursor-pointer items-baseline justify-between gap-3 px-3 py-2 text-sm ${index === active ? "bg-surface" : ""}`}
            >
              <span className="truncate">{option.label}</span>
              <span className="shrink-0 text-xs text-text-muted">{contentTypeLabels[option.type]}</span>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}
