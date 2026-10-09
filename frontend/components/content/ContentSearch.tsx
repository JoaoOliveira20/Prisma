"use client";

import type { ReactNode } from "react";
import { controlClass, SearchField } from "@/components/ui/SearchField";
import { useUrlFilters } from "@/lib/useUrlFilters";
import type { Tag } from "@/types/api";
import { TagFilter } from "./TagFilter";

type ContentSearchProps = {
  label: string;
  placeholder: string;
  tags?: Pick<Tag, "slug" | "name">[];
  withSort?: boolean;
  children: ReactNode;
};

export function ContentSearch({ label, placeholder, tags = [], withSort = false, children }: ContentSearchProps) {
  const { params, query, setQuery, apply, pending, commitQuery, clearQuery, clearAll } = useUrlFilters();
  const activeTag = params.get("tag") ?? undefined;
  const sort = params.get("sort") === "recent" ? "recent" : "name";
  const hasCriteria = Boolean(query || activeTag);

  return (
    <>
      <div role="search" aria-label={label} className="page-x border-y border-border py-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <SearchField
            id="content-search"
            label={label}
            placeholder={placeholder}
            value={query}
            onChange={setQuery}
            onSubmit={commitQuery}
            onClear={clearQuery}
            className="basis-full sm:flex-1 sm:basis-auto sm:max-w-xl"
          />
          <div className="flex min-h-11 basis-full items-center justify-between gap-4 sm:ml-auto sm:basis-auto sm:justify-end">
            {withSort && (
              <label className="flex items-center gap-2 text-sm text-text-muted">
                Ordem
                <select value={sort} onChange={(event) => apply({ sort: event.target.value === "recent" ? "recent" : undefined })} className={`${controlClass} cursor-pointer pr-2 text-text`}>
                  <option value="name">Alfabética</option>
                  <option value="recent">Mais recentes</option>
                </select>
              </label>
            )}
            {hasCriteria && (
              <button type="button" onClick={() => clearAll(["tag"])} className="results-in underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-text ml-auto px-1 py-2 text-sm text-text-muted hover:text-text sm:ml-0">
                Limpar tudo
              </button>
            )}
          </div>
        </div>
        {tags.length > 0 && (
          <div className="mt-3">
            <TagFilter tags={tags} active={activeTag} onChange={(slug) => apply({ tag: slug })} />
          </div>
        )}
      </div>
      <div aria-busy={pending} className={`transition-opacity duration-200 ${pending ? "opacity-50" : ""}`}>
        {children}
      </div>
    </>
  );
}
