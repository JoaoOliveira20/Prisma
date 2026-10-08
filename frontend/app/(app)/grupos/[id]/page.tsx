import type { Metadata } from "next";
import Link from "next/link";
import { ContentGrid } from "@/components/content/ContentGrid";
import { GroupSettings } from "@/components/groups/GroupSettings";
import { ReferenceGallery } from "@/components/references/ReferenceGallery";
import { PageHeader } from "@/components/layout/PageHeader";
import { personToCard, referenceToGalleryItem, strategyToCard, styleToCard } from "@/lib/content";
import { getGroup, getGroups } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/grupos/[id]">): Promise<Metadata> {
  const { id } = await params;
  const group = await getGroup(id);
  return { title: group.name };
}

export default async function GroupDetailPage({ params }: PageProps<"/grupos/[id]">) {
  const { id } = await params;
  const [group, groups] = await Promise.all([getGroup(id), getGroups()]);

  const sections = [
    { title: "Estilos", items: group.styles.map(styleToCard) },
    { title: "Pessoas", items: group.people.map(personToCard) },
    { title: "Estratégias", items: group.strategies.map(strategyToCard) },
  ].filter((section) => section.items.length > 0);
  const isEmpty = sections.length === 0 && group.references.length === 0;

  return (
    <>
      <PageHeader
        title={group.name}
        subtitle={`${group.items_count} ${group.items_count === 1 ? "item" : "itens"}`}
        actions={<Link href="/grupos" className="shrink-0 text-sm text-text-muted hover:text-text">← Grupos</Link>}
      />
      <div className="px-5 pb-12 sm:px-10">
        {group.can.update && <GroupSettings group={group} />}
        {isEmpty ? (
          <ContentGrid items={[]} emptyMessage="Este grupo ainda está vazio. Use “Salvar em grupo” nas páginas de conteúdo." />
        ) : (
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.title} aria-labelledby={`section-${section.title}`} className="space-y-4">
                <h2 id={`section-${section.title}`} className="font-serif text-xl">{section.title}</h2>
                <ContentGrid items={section.items} emptyMessage="" />
              </section>
            ))}
            {group.references.length > 0 && (
              <section aria-labelledby="section-references" className="space-y-4">
                <h2 id="section-references" className="font-serif text-xl">Referências</h2>
                <ReferenceGallery items={group.references.map(referenceToGalleryItem)} groups={groups} />
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
