import type { Metadata } from "next";
import Link from "next/link";
import { ContentGrid } from "@/components/content/ContentGrid";
import { DetailActions } from "@/components/content/DetailActions";
import { Paragraphs } from "@/components/content/Paragraphs";
import { CoverImage } from "@/components/content/CoverImage";
import { TagList } from "@/components/content/TagList";
import { EntityReferences } from "@/components/references/EntityReferences";
import { Tabs } from "@/components/ui/Tabs";
import { EmptySection } from "@/components/ui/EmptySection";
import { personToCard, strategyToCard } from "@/lib/content";
import { getGroups, getStyle } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/estilos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const style = await getStyle(slug);
  return { title: style.name };
}

export default async function StyleDetailPage({ params }: PageProps<"/estilos/[slug]">) {
  const { slug } = await params;
  const [style, groups] = await Promise.all([getStyle(slug), getGroups()]);
  const references = style.references ?? [];
  const people = style.people ?? [];
  const strategies = style.strategies ?? [];

  const tabs = [
    {
      id: "history",
      label: "História",
      content: style.history ? <Paragraphs text={style.history} /> : <EmptySection message="A história deste estilo ainda não foi escrita." />,
    },
    {
      id: "characteristics",
      label: "Características",
      content:
        style.characteristics.length > 0 ? (
          <ul className="grid max-w-xl gap-2 sm:grid-cols-2">
            {style.characteristics.map((item) => (
              <li key={item} className="rounded-md border border-border bg-surface-raised px-4 py-3 text-sm">{item}</li>
            ))}
          </ul>
        ) : (
          <EmptySection message="Nenhuma característica registrada." />
        ),
    },
    {
      id: "influences",
      label: "Influências",
      content: style.influences ? <p className="max-w-prose text-[15px] leading-relaxed">{style.influences}</p> : <EmptySection message="Nenhuma influência registrada." />,
    },
    {
      id: "people",
      label: `Pessoas (${people.length})`,
      content: <ContentGrid items={people.map(personToCard)} emptyMessage="Nenhuma pessoa relacionada a este estilo." />,
    },
    {
      id: "strategies",
      label: `Estratégias (${strategies.length})`,
      content: <ContentGrid items={strategies.map(strategyToCard)} emptyMessage="Nenhuma estratégia relacionada a este estilo." />,
    },
    {
      id: "references",
      label: `Referências (${references.length})`,
      content: <EntityReferences type="style" slug={style.slug} references={references} groups={groups} canAdd={style.can.update} />,
    },
  ];

  return (
    <article className="px-5 pb-12 pt-8 sm:px-10">
      <nav aria-label="Trilha" className="mb-6 text-xs text-text-muted">
        <Link href="/estilos" className="hover:text-text">Estilos</Link> <span aria-hidden="true">/</span> <span>{style.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[18rem_1fr]">
        <CoverImage name={style.name} coverUrl={style.cover_url} sizes="(min-width: 768px) 18rem, 100vw" className="aspect-square w-full rounded-lg" />
        <div className="space-y-5">
          <div>
            <h1 className="font-serif text-4xl">{style.name}</h1>
            {style.summary && <p className="mt-2 max-w-prose text-text-muted">{style.summary}</p>}
          </div>

          <dl className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
            {style.period && (
              <div>
                <dt className="text-xs text-text-muted">Período</dt>
                <dd>{style.period}</dd>
              </div>
            )}
            {style.origin && (
              <div>
                <dt className="text-xs text-text-muted">Origem</dt>
                <dd>{style.origin}</dd>
              </div>
            )}
          </dl>

          <TagList tags={style.tags ?? []} />

          <DetailActions
            type="style"
            slug={style.slug}
            name={style.name}
            editHref={`/estilos/${style.slug}/editar`}
            isFavorite={style.is_favorite}
            groupIds={style.group_ids ?? []}
            groups={groups}
            canUpdate={style.can.update}
            canDelete={style.can.delete}
          />
        </div>
      </div>

      <div className="mt-10">
        <Tabs tabs={tabs} />
      </div>
    </article>
  );
}
