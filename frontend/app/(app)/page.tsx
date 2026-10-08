import type { Metadata } from "next";
import Link from "next/link";
import { ContentGrid } from "@/components/content/ContentGrid";
import { CoverImage } from "@/components/content/CoverImage";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { ReferenceGallery } from "@/components/references/ReferenceGallery";
import { LinkButton } from "@/components/ui/Button";
import { personToCard, strategyToCard, styleToCard } from "@/lib/content";
import { getCurrentUser, getGroup, getGroups, getImagesPage, getPeoplePage, getStrategiesPage, getStylesPage } from "@/lib/data";

export const metadata: Metadata = { title: "Início" };

export default async function HomePage() {
  const [user, styles, people, strategies, images, groups] = await Promise.all([
    getCurrentUser(),
    getStylesPage({ sort: "recent", perPage: 1 }),
    getPeoplePage({ perPage: 1 }),
    getStrategiesPage({ perPage: 1 }),
    getImagesPage({ perPage: 8 }),
    getGroups(),
  ]);
  const favoritesGroup = groups.find((group) => group.is_favorites);
  const favorites = favoritesGroup ? await getGroup(String(favoritesGroup.id)) : null;
  const favoriteCards = favorites
    ? [...favorites.styles.map(styleToCard), ...favorites.people.map(personToCard), ...favorites.strategies.map(strategyToCard)].slice(0, 3)
    : [];
  const featured = styles.data[0];
  const dimensions = [
    { label: "Estilos", href: "/estilos", total: styles.meta.total },
    { label: "Pessoas", href: "/pessoas", total: people.meta.total },
    { label: "Estratégias", href: "/estrategias", total: strategies.meta.total },
    { label: "Referências", href: "/referencias", total: images.meta.total },
  ];

  return (
    <>
      <PageHeader
        eyebrow={`Arquivo de ${user.name.split(" ")[0]}`}
        title="Uma coisa → várias dimensões."
        lede="Entre por uma imagem, um estilo, uma pessoa ou uma ideia, e siga as ligações entre eles."
      />

      <div className="page-x space-y-24 pb-8">
        {featured ? (
          <Link href={`/estilos/${featured.slug}`} className="group grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
            <CoverImage name={featured.name} coverUrl={featured.cover_url} sizes="(min-width: 1024px) 58vw, 90vw" className="aspect-[4/3] w-full lg:col-span-7 [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-[1.02]" />
            <div className="flex flex-col justify-end lg:col-span-5">
              <p className="eyebrow">Em destaque · Estilo{featured.period ? ` · ${featured.period}` : ""}</p>
              <h2 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight xl:text-6xl">{featured.name}</h2>
              {featured.summary && <p className="mt-5 max-w-md text-lg leading-relaxed text-text-muted">{featured.summary}</p>}
              <span className="mt-8 text-sm underline-offset-4 group-hover:underline">Abrir estilo →</span>
            </div>
          </Link>
        ) : (
          <div className="border-y border-border py-20">
            <p className="max-w-lg font-serif text-3xl leading-snug text-text-muted">Seu arquivo ainda está vazio. Comece por um estilo.</p>
            <div className="mt-8">
              <LinkButton href="/estilos/novo">Novo estilo</LinkButton>
            </div>
          </div>
        )}

        <Section id="home-dimensions" title="Dimensões">
          <ul>
            {dimensions.map((dimension) => (
              <li key={dimension.href} className="border-t border-border first:border-t-0">
                <Link href={dimension.href} className="group flex items-baseline justify-between gap-6 py-5">
                  <span className="font-serif text-4xl leading-none transition-transform duration-300 group-hover:translate-x-2 sm:text-5xl">{dimension.label}</span>
                  <span className="flex items-baseline gap-5 text-text-muted">
                    <span className="tabular text-sm">{dimension.total}</span>
                    <span aria-hidden="true" className="text-2xl transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        {images.data.length > 0 && (
          <Section id="home-recent" title="Adicionado recentemente" seeAllHref="/referencias">
            <ReferenceGallery items={images.data} groups={groups} />
          </Section>
        )}

        <Section id="home-favorites" title="Favoritos" seeAllHref={favoriteCards.length > 0 ? "/favoritos" : undefined}>
          <ContentGrid items={favoriteCards} emptyMessage="Favorite algo e ele aparece aqui, ao alcance de um clique." />
        </Section>
      </div>
    </>
  );
}
