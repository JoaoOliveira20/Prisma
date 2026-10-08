import Link from "next/link";
import { pageHref } from "@/lib/pagination";
import type { PageMeta } from "@/types/api";

type PaginationProps = {
  meta: PageMeta;
  basePath: string;
  params?: Record<string, string | undefined>;
};

export function Pagination({ meta, basePath, params = {} }: PaginationProps) {
  if (meta.last_page <= 1) {
    return null;
  }

  const hrefFor = (page: number) => pageHref(basePath, params, page);

  const linkClass = "rounded-md border border-border bg-surface-raised px-3 py-1.5 text-sm hover:bg-surface";
  const disabledClass = "rounded-md border border-border px-3 py-1.5 text-sm text-text-muted/50";

  return (
    <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-4">
      {meta.current_page > 1 ? (
        <Link href={hrefFor(meta.current_page - 1)} rel="prev" className={linkClass}>← Anterior</Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>← Anterior</span>
      )}
      <span className="text-sm text-text-muted">Página {meta.current_page} de {meta.last_page}</span>
      {meta.current_page < meta.last_page ? (
        <Link href={hrefFor(meta.current_page + 1)} rel="next" className={linkClass}>Próxima →</Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>Próxima →</span>
      )}
    </nav>
  );
}
