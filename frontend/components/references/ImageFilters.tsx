import Link from "next/link";
import { NavIcon } from "@/components/layout/NavIcon";
import type { Style } from "@/types/api";

type ImageFiltersProps = {
  kind?: string;
  q?: string;
  style?: string;
  mine?: boolean;
  styles: Pick<Style, "slug" | "name">[];
};

const kinds = [
  { value: undefined, label: "Todas" },
  { value: "reference", label: "Referências" },
  { value: "style", label: "Estilos" },
  { value: "person", label: "Pessoas" },
  { value: "strategy", label: "Estratégias" },
] as const;

export function ImageFilters({ kind, q, style, mine, styles }: ImageFiltersProps) {
  const hrefFor = (value?: string) => {
    const params = new URLSearchParams();
    if (value) params.set("kind", value);
    if (q) params.set("q", q);
    if (style) params.set("style", style);
    if (mine) params.set("mine", "1");
    const search = params.toString();
    return search ? `/referencias?${search}` : "/referencias";
  };

  const linkClass = (active: boolean) =>
    `underline-offset-[7px] transition-colors ${active ? "text-text underline decoration-2" : "text-text-muted hover:text-text hover:underline hover:decoration-1"}`;
  const hasFilters = Boolean(kind || q || style || mine);

  return (
    <div className="page-x space-y-5 border-y border-border py-5">
      <nav aria-label="Origem da imagem">
        <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
          {kinds.map((item) => (
            <li key={item.label}>
              <Link href={hrefFor(item.value)} aria-current={kind === item.value ? "true" : undefined} className={linkClass(kind === item.value)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <form action="/referencias" role="search" className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {kind && <input type="hidden" name="kind" value={kind} />}
        <div className="relative min-w-60 flex-1 sm:max-w-lg">
          <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-text-muted"><NavIcon name="search" /></span>
          <label className="sr-only" htmlFor="image-search">Buscar imagens</label>
          <input
            id="image-search"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por título, descrição ou crédito"
            className="h-11 w-full border-b border-border-strong bg-transparent pl-7 pr-2 font-serif text-lg placeholder:text-text-muted focus:border-text"
          />
        </div>
        <label className="sr-only" htmlFor="image-style">Estilo</label>
        <select id="image-style" name="style" defaultValue={style ?? ""} className="h-11 cursor-pointer border-b border-border-strong bg-transparent pr-2 text-sm">
          <option value="">Todos os estilos</option>
          {styles.map((item) => (
            <option key={item.slug} value={item.slug}>{item.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="mine" value="1" defaultChecked={mine} />
          Só o que eu criei
        </label>
        <button type="submit" className="h-11 text-sm font-medium underline-offset-4 hover:underline">Filtrar</button>
        {hasFilters && <Link href="/referencias" className="text-sm text-text-muted underline-offset-4 hover:text-text hover:underline">Limpar</Link>}
      </form>
    </div>
  );
}
