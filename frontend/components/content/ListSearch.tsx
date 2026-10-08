import { NavIcon } from "@/components/layout/NavIcon";

type ListSearchProps = {
  basePath: string;
  query?: string;
  tag?: string;
  style?: string;
  sort?: string;
  placeholder: string;
  withSort?: boolean;
};

export function ListSearch({ basePath, query, tag, style, sort, placeholder, withSort = true }: ListSearchProps) {
  const clearParams = new URLSearchParams();
  if (tag) clearParams.set("tag", tag);
  if (style) clearParams.set("style", style);
  const clearHref = clearParams.size > 0 ? `${basePath}?${clearParams}` : basePath;
  const showClear = Boolean(query || (withSort && sort === "recent"));

  return (
    <form action={basePath} role="search" className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {tag && <input type="hidden" name="tag" value={tag} />}
      {style && <input type="hidden" name="style" value={style} />}
      <div className="relative min-w-60 flex-1 sm:max-w-lg">
        <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-text-muted"><NavIcon name="search" /></span>
        <label className="sr-only" htmlFor="list-search">Buscar</label>
        <input
          id="list-search"
          type="search"
          name="q"
          defaultValue={query}
          placeholder={placeholder}
          className="h-11 w-full border-b border-border-strong bg-transparent pl-7 pr-2 font-serif text-lg placeholder:text-text-muted focus:border-text"
        />
      </div>
      {withSort && (
        <>
          <label className="sr-only" htmlFor="list-sort">Ordenar por</label>
          <select id="list-sort" name="sort" defaultValue={sort ?? "name"} className="h-11 cursor-pointer border-b border-border-strong bg-transparent pr-2 text-sm">
            <option value="name">Ordem alfabética</option>
            <option value="recent">Mais recentes</option>
          </select>
        </>
      )}
      <button type="submit" className="h-11 text-sm font-medium underline-offset-4 hover:underline">Buscar</button>
      {showClear && (
        <a href={clearHref} className="text-sm text-text-muted underline-offset-4 hover:text-text hover:underline">Limpar</a>
      )}
    </form>
  );
}
