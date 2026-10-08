import Link from "next/link";
import type { Tag } from "@/types/api";

type ContentFiltersProps = {
  basePath: string;
  tags: Tag[];
  activeTag?: string;
  query?: string;
  sort?: string;
};

export function ContentFilters({ basePath, tags, activeTag, query, sort }: ContentFiltersProps) {
  const hrefFor = (tag?: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tag) params.set("tag", tag);
    if (sort === "recent") params.set("sort", sort);
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs transition-colors ${
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface-raised text-text-muted hover:text-text"
    }`;

  return (
    <nav aria-label="Filtrar por tag" className="flex flex-wrap gap-2 px-5 pb-6 sm:px-10">
      <Link href={hrefFor()} aria-current={!activeTag ? "true" : undefined} className={chip(!activeTag)}>
        Todos
      </Link>
      {tags.map((tag) => (
        <Link key={tag.slug} href={hrefFor(tag.slug)} aria-current={activeTag === tag.slug ? "true" : undefined} className={chip(activeTag === tag.slug)}>
          {tag.name}
        </Link>
      ))}
    </nav>
  );
}
