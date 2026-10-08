type ListSearchProps = {
  basePath: string;
  query?: string;
  tag?: string;
  sort?: string;
  placeholder: string;
  withSort?: boolean;
};

export function ListSearch({ basePath, query, tag, sort, placeholder, withSort = true }: ListSearchProps) {
  return (
    <form action={basePath} role="search" className="flex flex-wrap items-center gap-2 px-5 pb-4 sm:px-10">
      {tag && <input type="hidden" name="tag" value={tag} />}
      <label className="sr-only" htmlFor="list-search">Buscar</label>
      <input
        id="list-search"
        type="search"
        name="q"
        defaultValue={query}
        placeholder={placeholder}
        className="w-full max-w-sm rounded-md border border-border bg-surface-raised px-3 py-2 text-sm"
      />
      {withSort && (
        <>
          <label className="sr-only" htmlFor="list-sort">Ordenar por</label>
          <select id="list-sort" name="sort" defaultValue={sort ?? "name"} className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm">
            <option value="name">Nome</option>
            <option value="recent">Mais recentes</option>
          </select>
        </>
      )}
      <button type="submit" className="rounded-md border border-border bg-surface-raised px-4 py-2 text-sm hover:bg-surface">Buscar</button>
      {(query || (withSort && sort === "recent")) && (
        <a href={tag ? `${basePath}?tag=${tag}` : basePath} className="text-sm text-text-muted hover:text-text">Limpar</a>
      )}
    </form>
  );
}
