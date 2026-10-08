import type { Metadata } from "next";
import Link from "next/link";
import { CoverImage } from "@/components/content/CoverImage";
import { ContentGrid } from "@/components/content/ContentGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { personToCard, strategyToCard, styleToCard } from "@/lib/content";
import { getCurrentUser, getGroup, getGroups, getStyles } from "@/lib/data";

export const metadata: Metadata = { title: "Início" };

export default async function HomePage() {
  const [user, recent, groups] = await Promise.all([getCurrentUser(), getStyles({ sort: "recent", perPage: 5 }), getGroups()]);
  const favoritesGroup = groups.find((group) => group.is_favorites);
  const favorites = favoritesGroup ? await getGroup(String(favoritesGroup.id)) : null;
  const favoriteCards = favorites
    ? [...favorites.styles.map(styleToCard), ...favorites.people.map(personToCard), ...favorites.strategies.map(strategyToCard)]
    : [];
  const featured = recent[0];

  return (
    <>
      <PageHeader title="Início" subtitle={`Olá, ${user.name.split(" ")[0]}. Uma curadoria visual, em um só lugar.`} />
      <div className="space-y-12 px-5 pb-12 sm:px-10">
        {featured ? (
          <Link href={`/estilos/${featured.slug}`} className="group relative block overflow-hidden rounded-lg">
            <CoverImage name={featured.name} coverUrl={featured.cover_url} sizes="100vw" className="aspect-[21/9] min-h-56 w-full" />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-night/85 via-night/20 to-transparent p-6 text-night-text sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-night-muted">Mais recente</p>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl">{featured.name}</h2>
              {featured.summary && <p className="mt-2 max-w-lg text-sm text-night-muted">{featured.summary}</p>}
            </div>
          </Link>
        ) : (
          <div className="rounded-lg border border-dashed border-border px-6 py-14 text-center">
            <p className="text-sm text-text-muted">Sua biblioteca está vazia. Comece criando um estilo.</p>
            <div className="mt-4">
              <LinkButton href="/estilos/novo">Novo estilo</LinkButton>
            </div>
          </div>
        )}

        <section aria-labelledby="favorites-heading" className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 id="favorites-heading" className="font-serif text-xl">Favoritos</h2>
            {favoritesGroup && <Link href={`/grupos/${favoritesGroup.id}`} className="text-xs text-text-muted hover:text-text">Ver grupo →</Link>}
          </div>
          <ContentGrid items={favoriteCards.slice(0, 4)} emptyMessage="Favorite conteúdos para encontrá-los rapidamente aqui." />
        </section>

        {recent.length > 1 && (
          <section aria-labelledby="recent-heading" className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 id="recent-heading" className="font-serif text-xl">Estilos recentes</h2>
              <Link href="/estilos" className="text-xs text-text-muted hover:text-text">Ver todos →</Link>
            </div>
            <ContentGrid items={recent.slice(1, 5).map(styleToCard)} emptyMessage="" />
          </section>
        )}
      </div>
    </>
  );
}
