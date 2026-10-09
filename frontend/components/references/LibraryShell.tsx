"use client";

import { useState, type ReactNode } from "react";
import { controlClass, SearchField } from "@/components/ui/SearchField";
import { useUrlFilters } from "@/lib/useUrlFilters";
import type { LinkOption } from "@/types/api";

type FilterKey = "style" | "person" | "strategy" | "tag" | "group";

type LibraryShellProps = {
  options: Record<FilterKey, LinkOption[]>;
  children: ReactNode;
};

const filterLabels: Record<FilterKey, string> = {
  style: "Estilo",
  person: "Pessoa",
  strategy: "Estratégia",
  tag: "Tag",
  group: "Coleção",
};

const kinds = [
  { value: "", label: "Todas" },
  { value: "reference", label: "Referências" },
  { value: "style", label: "Estilos" },
  { value: "person", label: "Pessoas" },
  { value: "strategy", label: "Estratégias" },
];

const filterKeys = Object.keys(filterLabels) as FilterKey[];

export function LibraryShell({ options, children }: LibraryShellProps) {
  const { params, query, setQuery, apply, pending, commitQuery, clearQuery, clearAll: clearEverything } = useUrlFilters();
  const [panelOpen, setPanelOpen] = useState(false);

  const activeFilters = filterKeys.flatMap((key) => {
    const value = params.get(key);
    const label = options[key].find((option) => option.value === value)?.label;
    return value ? [{ key, value, label: label ?? value }] : [];
  });
  const kind = params.get("kind") ?? "";
  const contextual = Boolean(params.get("person") || params.get("strategy"));
  const activeCount = activeFilters.length;
  const clearAll = () => clearEverything(["kind", ...filterKeys]);
  const hasAnything = Boolean(query || kind || activeCount);

  const selectClass = "h-11 w-full cursor-pointer border-b border-border-strong bg-transparent pr-2 text-sm focus:border-text";

  return (
    <>
      <div role="search" className="page-x border-y border-border py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <SearchField
            id="library-search"
            label="Buscar na biblioteca"
            placeholder="Título, tag, estilo, pessoa, fonte…"
            value={query}
            onChange={setQuery}
            onSubmit={commitQuery}
            onClear={clearQuery}
            className="order-1 basis-full sm:flex-1 sm:basis-auto sm:max-w-xl"
          />

          <button
            type="button"
            onClick={() => setPanelOpen((open) => !open)}
            aria-expanded={panelOpen}
            aria-controls="library-filters"
            className="order-2 flex h-11 items-center gap-2 text-sm font-medium transition-colors hover:text-text-muted"
          >
            Filtros
            {activeCount > 0 && <span className="tabular grid size-5 place-items-center bg-text text-[11px] text-background">{activeCount}</span>}
            <span aria-hidden="true" className={`transition-transform duration-300 ease-[var(--ease-out)] ${panelOpen ? "rotate-180" : ""}`}>⌄</span>
          </button>

          <div className="order-3 ml-auto flex items-center gap-2 text-sm">
            <label htmlFor="library-sort" className="text-text-muted">Ordem</label>
            <select
              id="library-sort"
              value={params.get("sort") ?? "recent"}
              onChange={(event) => apply({ sort: event.target.value === "recent" ? undefined : event.target.value })}
              className={`${controlClass} cursor-pointer pr-2`}
            >
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
            </select>
          </div>
        </div>

        <div
          id="library-filters"
          inert={!panelOpen}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out)] ${panelOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-4 lg:grid-cols-3 xl:grid-cols-6">
              {filterKeys.map((key) => (
                <div key={key}>
                  <label className="eyebrow block" htmlFor={`library-${key}`}>{filterLabels[key]}</label>
                  <select id={`library-${key}`} value={params.get(key) ?? ""} onChange={(event) => apply({ [key]: event.target.value || undefined })} className={selectClass}>
                    <option value="">Todos</option>
                    {options[key].map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!contextual && (
          <nav aria-label="Origem da imagem" className="mt-3">
            <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
              {kinds.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => apply({ kind: item.value || undefined })}
                    aria-current={kind === item.value ? "true" : undefined}
                    className={`nav-link ${kind === item.value ? "text-text" : "text-text-muted hover:text-text"}`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {(activeFilters.length > 0 || hasAnything) && (
          <ul aria-label="Filtros ativos" className="mt-4 flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <li key={filter.key} className="results-in">
                <button
                  type="button"
                  onClick={() => apply({ [filter.key]: undefined })}
                  aria-label={`Remover filtro ${filterLabels[filter.key]}: ${filter.label}`}
                  className="flex items-center gap-2 border border-border-strong py-1 pl-3 pr-2 text-xs transition-colors hover:bg-surface"
                >
                  <span className="text-text-muted">{filterLabels[filter.key]}</span>
                  {filter.label}
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
            {hasAnything && (
              <li>
                <button type="button" onClick={clearAll} className="underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-text ml-2 py-2 text-sm text-text-muted hover:text-text">
                  Limpar tudo
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      <div aria-busy={pending} className={`transition-opacity duration-200 ${pending ? "opacity-50" : ""}`}>
        {children}
      </div>
    </>
  );
}
