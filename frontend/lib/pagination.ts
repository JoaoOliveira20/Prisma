import { redirect } from "next/navigation";
import type { PageMeta } from "@/types/api";

export function pageHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function redirectIfBeyondLastPage(meta: PageMeta, basePath: string, params: Record<string, string | undefined>) {
  if (meta.last_page >= 1 && meta.current_page > meta.last_page) {
    redirect(pageHref(basePath, params, meta.last_page));
  }
}
