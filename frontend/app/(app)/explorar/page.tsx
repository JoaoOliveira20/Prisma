import type { Metadata } from "next";
import Link from "next/link";
import { ContentSearch } from "@/components/content/ContentSearch";
import { ContentGrid } from "@/components/content/ContentGrid";
import { StrategyList } from "@/components/content/StrategyList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { ReferenceGallery } from "@/components/references/ReferenceGallery";
import { personToCard, strategyToCard, styleToCard } from "@/lib/content";
import { getGroups, getImagesPage, getPeoplePage, getStrategiesPage, getStylesPage, getTags } from "@/lib/data";

export const metadata: Metadata = { title: "Explorar" };

export default async function ExplorePage({ searchParams }: PageProps<"/explorar">) {
  const { q, tag } = await searchParams;
  const query = typeof q === "string" && q !== "" ? q : undefined;
  const tagFilter = typeof tag === "string" && tag !== "" ? tag : undefined;
  const base = { q: query, tag: tagFilter, sort: "recent" as const };

  const [styles, people, strategies, images, tags, groups] = await Promise.all([
    getStylesPage({ ...base, perPage: 5 }),
    getPeoplePage({ ...base, perPage: 4 }),
    getStrategiesPage({ ...base, perPage: 4 }),
    tagFilter ? null : getImagesPage({ q: query, perPage: 8 }),
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
      <PageHeader eyebrow="Arquivo" title="Explorar" lede="Tudo o que está no seu acervo, num só lugar: estilos, imagens, pessoas e ideias, do mais recente ao mais antigo. Abra e vá escolhendo." />
      <ContentSearch label="Buscar em todo o acervo" placeholder="Buscar em todo o acervo" tags={tags}>
      <div className="page-x space-y-24 pt-14">
        {nothingFound && (
          <div>
            <p className="font-serif text-2xl text-text-muted">Nada encontrado{query || tagFilter ? " com esses filtros" : " ainda"}.</p>
            {(query || tagFilter) && <Link href="/explorar" className="underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-text mt-4 inline-block text-sm text-text-muted hover:text-text">Limpar busca e filtros</Link>}
          </div>
        )}
        {styles.meta.total > 0 && (
          <Section id="explore-styles" title="Estilos" count={styles.meta.total} seeAllHref={styles.meta.total > styles.data.length ? `/estilos${suffix}` : undefined}>
            <ContentGrid items={styles.data.map(styleToCard)} layout="rhythm" emptyMessage="" />
          </Section>
        )}
        {images && images.meta.total > 0 && (
          <Section id="explore-images" title="Imagens" count={images.meta.total} seeAllHref={images.meta.total > images.data.length ? `/referencias${query ? `?q=${encodeURIComponent(query)}` : ""}` : undefined}>
            <ReferenceGallery items={images.data} groups={groups} />
          </Section>
        )}
        {people.meta.total > 0 && (
          <Section id="explore-people" title="Pessoas" count={people.meta.total} seeAllHref={people.meta.total > people.data.length ? `/pessoas${suffix}` : undefined}>
            <ContentGrid items={people.data.map(personToCard)} layout="portraits" emptyMessage="" />
          </Section>
        )}
        {strategies.meta.total > 0 && (
          <Section id="explore-strategies" title="Estratégias" count={strategies.meta.total} seeAllHref={strategies.meta.total > strategies.data.length ? `/estrategias${suffix}` : undefined}>
            <StrategyList items={strategies.data.map(strategyToCard)} emptyMessage="" />
          </Section>
        )}
      </div>
      </ContentSearch>
    </>
  );
}
