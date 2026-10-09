"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

const DEBOUNCE_MS = 250;

export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const urlQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const appliedQuery = useRef(urlQuery);

  const apply = useCallback(
    (changes: Record<string, string | undefined>) => {
      const next = new URLSearchParams(params.toString());
      next.delete("page");
      next.delete("nova");
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const search = next.toString();
      startTransition(() => router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false }));
    },
    [params, pathname, router],
  );

  useEffect(() => {
    if (urlQuery !== appliedQuery.current) {
      appliedQuery.current = urlQuery;
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    if (query === appliedQuery.current) return;
    const timer = setTimeout(() => {
      appliedQuery.current = query;
      apply({ q: query || undefined });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, apply]);

  const commitQuery = () => {
    appliedQuery.current = query;
    apply({ q: query || undefined });
  };

  const clearQuery = () => {
    appliedQuery.current = "";
    setQuery("");
    apply({ q: undefined });
  };

  const clearAll = (keys: string[]) => {
    appliedQuery.current = "";
    setQuery("");
    apply({ q: undefined, ...Object.fromEntries(keys.map((key) => [key, undefined])) });
  };

  return { params, query, setQuery, apply, pending, commitQuery, clearQuery, clearAll };
}
