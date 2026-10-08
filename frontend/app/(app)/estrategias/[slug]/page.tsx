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
  const referencesTotal = strategy.references_count ?? references.length;

  const sections = [
    { id: "descricao", label: "Descrição" },
    { id: "estilos", label: "Aplica-se a", count: styles.length },
    { id: "referencias", label: "Referências", count: referencesTotal, ...(referencesTotal > 0 ? { href: `/estrategias/${strategy.slug}/referencias` } : {}) },
  ];

  return (
    <article>
      <DetailHeader
        crumbs={[{ label: "Estratégias", href: "/estrategias" }, { label: strategy.name }]}
        kind={strategy.category ? `Estratégia · ${strategy.category}` : "Estratégia"}
        title={strategy.name}
        lede={strategy.summary}
        tags={strategy.tags}
        image={{ name: strategy.name, url: strategy.cover_url, aspect: "aspect-[4/3]" }}
        layout="wide-right"
        actions={
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
        }
      />
      <SectionNav sections={sections} />

      <DimensionSection id="descricao" eyebrow="Dimensão" title="Descrição">
        {strategy.description ? <Paragraphs text={strategy.description} /> : <EmptySection message="A descrição ainda não foi escrita." />}
      </DimensionSection>
      <DimensionSection id="estilos" eyebrow="Conexão" title="Aplica-se a" count={styles.length}>
        <ContentGrid items={styles.map(styleToCard)} emptyMessage="Nenhum estilo relacionado a esta estratégia." />
      </DimensionSection>
      <DimensionSection
        id="referencias"
        eyebrow="Imagens"
        title="Referências"
        count={referencesTotal}
        action={strategy.can.update && <AddReferenceButton type="strategy" slug={strategy.slug} />}
        seeAll={referencesTotal > 0 ? { href: `/estrategias/${strategy.slug}/referencias`, label: `Ver todas as ${referencesTotal} referências` } : undefined}
      >
        <ReferenceGallery items={references.map(referenceToGalleryItem)} groups={groups} emptyMessage="Nenhuma referência adicionada ainda." />
      </DimensionSection>
    </article>
  );
}
