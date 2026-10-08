import type { Metadata } from "next";
import { ContentGrid } from "@/components/content/ContentGrid";
import { DetailActions } from "@/components/content/DetailActions";
import { Paragraphs } from "@/components/content/Paragraphs";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { DimensionSection } from "@/components/layout/DimensionSection";
import { SectionNav } from "@/components/layout/SectionNav";
import { AddReferenceButton } from "@/components/references/AddReferenceButton";
import { ReferenceGallery } from "@/components/references/ReferenceGallery";
import { EmptySection } from "@/components/ui/EmptySection";
import { referenceToGalleryItem, styleToCard } from "@/lib/content";
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
  const facts = [
    ...(person.role ? [{ label: "Atuação", value: person.role }] : []),
    ...(person.origin ? [{ label: "Origem", value: person.origin }] : []),
  ];

  const sections = [
    { id: "biografia", label: "Biografia" },
    { id: "estilos", label: "Estilos", count: styles.length },
    { id: "referencias", label: "Referências", count: references.length },
  ];

  return (
    <article>
      <DetailHeader
        crumbs={[{ label: "Pessoas", href: "/pessoas" }, { label: person.name }]}
        kind="Pessoa"
        title={person.name}
        subtitle={person.period}
        lede={person.summary}
        facts={facts}
        tags={person.tags}
        image={{ name: person.name, url: person.photo_url, aspect: "aspect-[4/5]" }}
        layout="portrait"
        actions={
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
        }
      />
      <SectionNav sections={sections} />

      <DimensionSection id="biografia" eyebrow="Dimensão" title="Biografia">
        {person.biography ? <Paragraphs text={person.biography} /> : <EmptySection message="A biografia ainda não foi escrita." />}
      </DimensionSection>
      <DimensionSection id="estilos" eyebrow="Conexão" title="Estilos" count={styles.length}>
        <ContentGrid items={styles.map(styleToCard)} emptyMessage="Nenhum estilo relacionado a esta pessoa." />
      </DimensionSection>
      <DimensionSection
        id="referencias"
        eyebrow="Imagens"
        title="Referências"
        count={references.length}
        action={person.can.update && <AddReferenceButton type="person" slug={person.slug} />}
      >
        <ReferenceGallery items={references.map(referenceToGalleryItem)} groups={groups} emptyMessage="Nenhuma referência adicionada ainda." />
      </DimensionSection>
    </article>
  );
}
