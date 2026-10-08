import Link from "next/link";

type FilterContextProps = {
  kind: string;
  name: string;
  openHref: string;
  clearHref: string;
};

export function FilterContext({ kind, name, openHref, clearHref }: FilterContextProps) {
  return (
    <div className="page-x results-in">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3 border-t border-border pb-5 pt-4">
        <div className="min-w-0">
          <p className="eyebrow">Filtrando por {kind}</p>
          <p className="mt-2 break-words font-serif text-3xl leading-tight sm:text-4xl">{name}</p>
        </div>
        <p className="flex items-baseline gap-6 pb-1 text-sm">
          <Link href={openHref} className="nav-link">Abrir {kind}</Link>
          <Link href={clearHref} className="nav-link text-text-muted hover:text-text">Remover filtro</Link>
        </p>
      </div>
    </div>
  );
}
