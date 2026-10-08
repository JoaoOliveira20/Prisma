import type { Metadata } from "next";
import { ContentFilters } from "@/components/content/ContentFilters";
import { ContentGrid } from "@/components/content/ContentGrid";
import { DiscoverySection } from "@/components/content/DiscoverySection";
import { ListSearch } from "@/components/content/ListSearch";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReferenceGallery } from "@/components/references/ReferenceGallery";
import { personToCard, strategyToCard, styleToCard } from "@/lib/content";
import { getGroups, getImagesPage, getPeoplePage, getStrategiesPage, getStylesPage, getTags } from "@/lib/data";

export const metadata: Metadata = { title: "Explorar" };

const SECTION_SIZE = 8;

export default async function ExplorePage({ searchParams }: PageProps<"/explorar">) {
  const { q, tag } = await searchParams;
  const query = typeof q === "string" && q !== "" ? q : undefined;
  const tagFilter = typeof tag === "string" && tag !== "" ? tag : undefined;
  const filters = { q: query, tag: tagFilter, sort: "recent" as const, perPage: SECTION_SIZE };

  const [styles, people, strategies, images, tags, groups] = await Promise.all([
    getStylesPage(filters),
    getPeoplePage(filters),
    getStrategiesPage(filters),
    tagFilter ? null : getImagesPage({ q: query, perPage: SECTION_SIZE }),
    getTags(),
    getGroups(),
  ]);

  const search = new URLSearchParams();
  if (query) search.set("q", query);
  if (tagFilter) search.set("tag", tagFilter);
  const suffix = search.toString() ? `?${search}` : "";
  const nothingFound = [styles, people, strategies, images].every((section) => !section || section.meta.total === 0);

  return (
    <>
      <PageHeader title="Explorar" subtitle="Descubra estilos, pessoas, estratégias e imagens em um só lugar." />
      <ListSearch basePath="/explorar" query={query} tag={tagFilter} placeholder="Buscar em todo o acervo" withSort={false} />
      <ContentFilters basePath="/explorar" tags={tags} activeTag={tagFilter} query={query} />
      <div className="space-y-12 px-5 pb-12 sm:px-10">
        {nothingFound && (
          <p className="rounded-md border border-dashed border-border px-6 py-14 text-center text-sm text-text-muted">
            Nada encontrado{query || tagFilter ? " com esses filtros" : " ainda"}.
          </p>
        )}
        {styles.meta.total > 0 && (
          <DiscoverySection id="explore-styles" title="Estilos" total={styles.meta.total} shown={styles.data.length} seeAllHref={`/estilos${suffix}`}>
            <ContentGrid items={styles.data.map(styleToCard)} emptyMessage="" />
          </DiscoverySection>
        )}
        {people.meta.total > 0 && (
          <DiscoverySection id="explore-people" title="Pessoas" total={people.meta.total} shown={people.data.length} seeAllHref={`/pessoas${suffix}`}>
            <ContentGrid items={people.data.map(personToCard)} emptyMessage="" />
          </DiscoverySection>
        )}
        {strategies.meta.total > 0 && (
          <DiscoverySection id="explore-strategies" title="Estratégias" total={strategies.meta.total} shown={strategies.data.length} seeAllHref={`/estrategias${suffix}`}>
            <ContentGrid items={strategies.data.map(strategyToCard)} emptyMessage="" />
          </DiscoverySection>
        )}
        {images && images.meta.total > 0 && (
          <DiscoverySection id="explore-images" title="Imagens" total={images.meta.total} shown={images.data.length} seeAllHref={`/referencias${query ? `?q=${encodeURIComponent(query)}` : ""}`}>
            <ReferenceGallery items={images.data} groups={groups} />
          </DiscoverySection>
        )}
      </div>
    </>
  );
}
