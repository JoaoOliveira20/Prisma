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
import { styleToCard } from "@/lib/content";
import { getGroups, getPerson } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/pessoas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const person = await getPerson(slug);
  return { title: person.name };
}

export default async function PersonDetailPage({ params }: PageProps<"/pessoas/[slug]">) {
  const { slug } = await params;
  const [person, groups] = await Promise.all([getPerson(slug), getGroups()]);
  const styles = person.styles ?? [];
  const references = person.references ?? [];

  const tabs = [
    {
      id: "biography",
      label: "Biografia",
      content: person.biography ? <Paragraphs text={person.biography} /> : <EmptySection message="A biografia ainda não foi escrita." />,
    },
    {
      id: "styles",
      label: `Estilos (${styles.length})`,
      content: <ContentGrid items={styles.map(styleToCard)} emptyMessage="Nenhum estilo relacionado a esta pessoa." />,
    },
    {
      id: "references",
      label: `Referências (${references.length})`,
      content: <EntityReferences type="person" slug={person.slug} references={references} groups={groups} canAdd={person.can.update} />,
    },
  ];

  return (
    <article className="px-5 pb-12 pt-8 sm:px-10">
      <nav aria-label="Trilha" className="mb-6 text-xs text-text-muted">
        <Link href="/pessoas" className="hover:text-text">Pessoas</Link> <span aria-hidden="true">/</span> <span>{person.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[16rem_1fr]">
        <CoverImage name={person.name} coverUrl={person.photo_url} sizes="(min-width: 768px) 16rem, 100vw" className="aspect-[4/5] w-full rounded-lg" />
        <div className="space-y-5">
          <div>
            <h1 className="font-serif text-4xl">{person.name}</h1>
            {person.role && <p className="mt-1 text-sm text-text-muted">{person.role}</p>}
            {person.summary && <p className="mt-3 max-w-prose text-text-muted">{person.summary}</p>}
          </div>

          <dl className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
            {person.period && (
              <div>
                <dt className="text-xs text-text-muted">Período</dt>
                <dd>{person.period}</dd>
              </div>
            )}
            {person.origin && (
              <div>
                <dt className="text-xs text-text-muted">Origem</dt>
                <dd>{person.origin}</dd>
              </div>
            )}
          </dl>

          <TagList tags={person.tags ?? []} />

          <DetailActions
            type="person"
            slug={person.slug}
            name={person.name}
            editHref={`/pessoas/${person.slug}/editar`}
            isFavorite={person.is_favorite}
            groupIds={person.group_ids ?? []}
            groups={groups}
            canUpdate={person.can.update}
            canDelete={person.can.delete}
          />
        </div>
      </div>

      <div className="mt-10">
        <Tabs tabs={tabs} />
      </div>
    </article>
  );
}
