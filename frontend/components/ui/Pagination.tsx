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
  const link = "underline-offset-4 hover:underline";
  const disabled = "text-text-muted/50";

  return (
    <nav aria-label="Paginação" className="mt-16 flex items-center justify-between border-t border-border pt-5 text-sm">
      {meta.current_page > 1 ? (
        <Link href={hrefFor(meta.current_page - 1)} rel="prev" className={link}>← Anterior</Link>
      ) : (
        <span aria-disabled="true" className={disabled}>← Anterior</span>
      )}
      <span className="tabular text-text-muted">Página {meta.current_page} de {meta.last_page}</span>
      {meta.current_page < meta.last_page ? (
        <Link href={hrefFor(meta.current_page + 1)} rel="next" className={link}>Próxima →</Link>
      ) : (
        <span aria-disabled="true" className={disabled}>Próxima →</span>
      )}
    </nav>
  );
}
