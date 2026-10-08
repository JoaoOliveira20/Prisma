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
import { getGroups, getStrategy } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/estrategias/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const strategy = await getStrategy(slug);
  return { title: strategy.name };
}

export default async function StrategyDetailPage({ params }: PageProps<"/estrategias/[slug]">) {
  const { slug } = await params;
  const [strategy, groups] = await Promise.all([getStrategy(slug), getGroups()]);
  const styles = strategy.styles ?? [];
  const references = strategy.references ?? [];

  const tabs = [
    {
      id: "description",
      label: "Descrição",
      content: strategy.description ? <Paragraphs text={strategy.description} /> : <EmptySection message="A descrição ainda não foi escrita." />,
    },
    {
      id: "styles",
      label: `Estilos (${styles.length})`,
      content: <ContentGrid items={styles.map(styleToCard)} emptyMessage="Nenhum estilo relacionado a esta estratégia." />,
    },
    {
      id: "references",
      label: `Referências (${references.length})`,
      content: <EntityReferences type="strategy" slug={strategy.slug} references={references} groups={groups} canAdd={strategy.can.update} />,
    },
  ];

  return (
    <article className="px-5 pb-12 pt-8 sm:px-10">
      <nav aria-label="Trilha" className="mb-6 text-xs text-text-muted">
        <Link href="/estrategias" className="hover:text-text">Estratégias</Link> <span aria-hidden="true">/</span> <span>{strategy.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[18rem_1fr]">
        <CoverImage name={strategy.name} coverUrl={strategy.cover_url} sizes="(min-width: 768px) 18rem, 100vw" className="aspect-square w-full rounded-lg" />
        <div className="space-y-5">
          <div>
            <h1 className="font-serif text-4xl">{strategy.name}</h1>
            {strategy.category && <p className="mt-1 text-sm text-text-muted">{strategy.category}</p>}
            {strategy.summary && <p className="mt-3 max-w-prose text-text-muted">{strategy.summary}</p>}
          </div>

          <TagList tags={strategy.tags ?? []} />

          <DetailActions
            type="strategy"
            slug={strategy.slug}
            name={strategy.name}
            editHref={`/estrategias/${strategy.slug}/editar`}
            isFavorite={strategy.is_favorite}
            groupIds={strategy.group_ids ?? []}
            groups={groups}
            canUpdate={strategy.can.update}
            canDelete={strategy.can.delete}
          />
        </div>
      </div>

      <div className="mt-10">
        <Tabs tabs={tabs} />
      </div>
    </article>
  );
}
