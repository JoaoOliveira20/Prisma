import Link from "next/link";
import type { Tag } from "@/types/api";

type ContentFiltersProps = {
  basePath: string;
  tags: Tag[];
  activeTag?: string;
  query?: string;
  style?: string;
  sort?: string;
};

export function ContentFilters({ basePath, tags, activeTag, query, style, sort }: ContentFiltersProps) {
  const hrefFor = (tag?: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tag) params.set("tag", tag);
    if (style) params.set("style", style);
    if (sort === "recent") params.set("sort", sort);
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  const linkClass = (active: boolean) => `nav-link ${active ? "text-text" : "text-text-muted hover:text-text"}`;

  return (
    <nav aria-label="Filtrar por tag">
      <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
        <li>
          <Link href={hrefFor()} aria-current={!activeTag ? "true" : undefined} className={linkClass(!activeTag)}>Todos</Link>
        </li>
        {tags.map((tag) => (
          <li key={tag.slug}>
            <Link href={hrefFor(tag.slug)} aria-current={activeTag === tag.slug ? "true" : undefined} className={linkClass(activeTag === tag.slug)}>
              {tag.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
