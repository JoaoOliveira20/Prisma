import Link from "next/link";
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

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs transition-colors ${
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface-raised text-text-muted hover:text-text"
    }`;
  const hasFilters = Boolean(kind || q || style || mine);

  return (
    <div className="space-y-4 px-5 pb-6 sm:px-10">
      <nav aria-label="Origem da imagem" className="flex flex-wrap gap-2">
        {kinds.map((item) => (
          <Link key={item.label} href={hrefFor(item.value)} aria-current={kind === item.value ? "true" : undefined} className={chip(kind === item.value)}>
            {item.label}
          </Link>
        ))}
      </nav>
      <form action="/referencias" role="search" className="flex flex-wrap items-center gap-2">
        {kind && <input type="hidden" name="kind" value={kind} />}
        <label className="sr-only" htmlFor="image-search">Buscar imagens</label>
        <input
          id="image-search"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por título, descrição ou crédito"
          className="w-full max-w-sm rounded-md border border-border bg-surface-raised px-3 py-2 text-sm"
        />
        <label className="sr-only" htmlFor="image-style">Estilo</label>
        <select id="image-style" name="style" defaultValue={style ?? ""} className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm">
          <option value="">Todos os estilos</option>
          {styles.map((item) => (
            <option key={item.slug} value={item.slug}>{item.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="mine" value="1" defaultChecked={mine} />
          Só o que eu criei
        </label>
        <button type="submit" className="rounded-md border border-border bg-surface-raised px-4 py-2 text-sm hover:bg-surface">Filtrar</button>
        {hasFilters && <Link href="/referencias" className="text-sm text-text-muted hover:text-text">Limpar</Link>}
      </form>
    </div>
  );
}
