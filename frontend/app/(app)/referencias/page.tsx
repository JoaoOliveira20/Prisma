import type { Metadata } from "next";
import { FilterContext } from "@/components/layout/FilterContext";
import { FeaturedReference } from "@/components/references/FeaturedReference";
import { LibraryEmpty } from "@/components/references/LibraryEmpty";
import { LibraryShell } from "@/components/references/LibraryShell";
import { NewReferenceButton } from "@/components/references/NewReferenceButton";
import { ReferenceGallery } from "@/components/references/ReferenceGallery";
import { Pagination } from "@/components/ui/Pagination";
import { getGroups, getImagesPage, getPeople, getPerson, getStrategies, getStrategy, getStyles, getTags } from "@/lib/data";
import { redirectIfBeyondLastPage } from "@/lib/pagination";

export const metadata: Metadata = { title: "Referências" };

const validKinds = ["reference", "style", "person", "strategy"];

const text = (value: string | string[] | undefined) => (typeof value === "string" && value !== "" ? value : undefined);

export default async function ReferencesPage({ searchParams }: PageProps<"/referencias">) {
  const { page, q, kind, style, tag, person, strategy, group, sort, nova } = await searchParams;
  const query = text(q);
  const kindFilter = validKinds.find((item) => item === text(kind));
  const styleFilter = text(style);
  const tagFilter = text(tag);
  const personFilter = text(person);
  const strategyFilter = text(strategy);
  const groupFilter = Number(text(group)) || undefined;
  const sortFilter = text(sort) === "oldest" ? "oldest" : undefined;
  const pageNumber = Number(page) || undefined;

  const [{ data, meta }, groups, styles, people, strategies, tags, contextPerson, contextStrategy] = await Promise.all([
    getImagesPage({
      q: query,
      kind: kindFilter,
      style: styleFilter,
      tag: tagFilter,
      person: personFilter,
      strategy: strategyFilter,
      group: groupFilter,
      sort: sortFilter,
      page: pageNumber,
    }),
    getGroups(),
    getStyles({ perPage: 100 }),
    getPeople({ perPage: 100 }),
    getStrategies({ perPage: 100 }),
    getTags(),
    personFilter ? getPerson(personFilter) : undefined,
    strategyFilter ? getStrategy(strategyFilter) : undefined,
  ]);

  const params = {
    q: query,
    kind: kindFilter,
    style: styleFilter,
    tag: tagFilter,
    person: personFilter,
    strategy: strategyFilter,
    group: groupFilter ? String(groupFilter) : undefined,
    sort: sortFilter,
  };
  redirectIfBeyondLastPage(meta, "/referencias", params);

  const filtered = Object.values(params).some(Boolean);
  const contextStyle = styles.find((item) => item.slug === styleFilter);
  const withoutContext = (name: "style" | "person" | "strategy") => {
    const rest = new URLSearchParams(Object.entries(params).flatMap(([key, value]) => (value && key !== name ? [[key, value]] : [])));
    return rest.size > 0 ? `/referencias?${rest}` : "/referencias";
  };

  const options = {
    style: styles.map((item) => ({ value: item.slug, label: item.name })),
    person: people.map((item) => ({ value: item.slug, label: item.name })),
    strategy: strategies.map((item) => ({ value: item.slug, label: item.name })),
    tag: tags.map((item) => ({ value: item.slug, label: item.name })),
    group: groups.map((item) => ({ value: String(item.id), label: item.name })),
  };

  const featured = !filtered && meta.current_page === 1 && data[0]?.kind === "reference" ? data[0] : undefined;
  const gallery = featured ? data.slice(1) : data;

  return (
    <>
      <header className="page-x flex flex-wrap items-end justify-between gap-x-10 gap-y-5 pb-8 pt-10 sm:pt-14">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="spectrum-rule" aria-hidden="true" />
            <p className="eyebrow">Biblioteca visual</p>
          </div>
          <h1 className="mt-5 font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">Referências</h1>
          <p className="mt-4 hidden max-w-xl leading-relaxed text-text-muted sm:block">
            O repertório em imagem. Busque, filtre e siga cada referência até os estilos, pessoas e estratégias de onde ela vem.
          </p>
        </div>
        <div className="flex items-end gap-8">
          <p aria-live="polite" className="tabular text-sm text-text-muted">
            <span className="mr-1.5 font-serif text-4xl leading-none text-text">{meta.total}</span>
            {meta.total === 1 ? "imagem" : "imagens"}
          </p>
          <NewReferenceButton defaultOpen={nova === "1"} />
        </div>
      </header>

      {contextStyle && <FilterContext kind="estilo" name={contextStyle.name} openHref={`/estilos/${contextStyle.slug}`} clearHref={withoutContext("style")} />}
      {contextPerson && <FilterContext kind="pessoa" name={contextPerson.name} openHref={`/pessoas/${contextPerson.slug}`} clearHref={withoutContext("person")} />}
      {contextStrategy && <FilterContext kind="estratégia" name={contextStrategy.name} openHref={`/estrategias/${contextStrategy.slug}`} clearHref={withoutContext("strategy")} />}

      <LibraryShell options={options}>
        <div key={JSON.stringify(params) + meta.current_page} className="page-x results-in pt-10">
          {meta.total === 0 ? (
            <LibraryEmpty filtered={filtered} query={query} />
          ) : (
            <>
              {featured && <FeaturedReference item={featured} />}
              {gallery.length > 0 && <ReferenceGallery selectable items={gallery} groups={groups} />}
              <Pagination meta={meta} basePath="/referencias" params={params} />
            </>
          )}
        </div>
      </LibraryShell>
    </>
  );
}
