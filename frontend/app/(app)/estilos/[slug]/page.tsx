import type { Metadata } from "next";
import { ContentGrid } from "@/components/content/ContentGrid";
import { DetailActions } from "@/components/content/DetailActions";
import { NumberedList } from "@/components/content/NumberedList";
import { Paragraphs } from "@/components/content/Paragraphs";
import { StrategyList } from "@/components/content/StrategyList";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { DimensionSection } from "@/components/layout/DimensionSection";
import { SectionNav } from "@/components/layout/SectionNav";
import { AddReferenceButton } from "@/components/references/AddReferenceButton";
import { ReferenceGallery } from "@/components/references/ReferenceGallery";
import { EmptySection } from "@/components/ui/EmptySection";
import { personToCard, referenceToGalleryItem, strategyToCard, styleToCard } from "@/lib/content";
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
  const related = (style.related ?? []).slice(0, 3);
  const facts = [
    ...(style.period ? [{ label: "Período", value: style.period }] : []),
    ...(style.origin ? [{ label: "Origem", value: style.origin }] : []),
  ];

  const sections = [
    { id: "historia", label: "História" },
    { id: "caracteristicas", label: "Características", count: style.characteristics.length },
    { id: "influencias", label: "Influências" },
    { id: "pessoas", label: "Pessoas", count: people.length },
    { id: "estrategias", label: "Estratégias", count: strategies.length },
    { id: "referencias", label: "Referências", count: references.length },
    ...(related.length > 0 ? [{ id: "relacionados", label: "Estilos relacionados", count: related.length }] : []),
  ];

  return (
    <article>
      <DetailHeader
        crumbs={[{ label: "Estilos", href: "/estilos" }, { label: style.name }]}
        kind="Estilo"
        title={style.name}
        lede={style.summary}
        facts={facts}
        tags={style.tags}
        image={{ name: style.name, url: style.cover_url, aspect: "aspect-[4/3]" }}
        layout="wide"
        actions={
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
        }
      />
      <SectionNav sections={sections} />

      <DimensionSection id="historia" eyebrow="Dimensão" title="História">
        {style.history ? <Paragraphs text={style.history} /> : <EmptySection message="A história deste estilo ainda não foi escrita." />}
      </DimensionSection>
      <DimensionSection id="caracteristicas" eyebrow="Dimensão" title="Características" count={style.characteristics.length}>
        {style.characteristics.length > 0 ? <NumberedList items={style.characteristics} /> : <EmptySection message="Nenhuma característica registrada." />}
      </DimensionSection>
      <DimensionSection id="influencias" eyebrow="Dimensão" title="Influências">
        {style.influences ? <p className="max-w-2xl font-serif text-2xl leading-snug">{style.influences}</p> : <EmptySection message="Nenhuma influência registrada." />}
      </DimensionSection>
      <DimensionSection id="pessoas" eyebrow="Conexão" title="Pessoas" count={people.length}>
        <ContentGrid items={people.map(personToCard)} layout="portraits-compact" emptyMessage="Nenhuma pessoa relacionada a este estilo." />
      </DimensionSection>
      <DimensionSection id="estrategias" eyebrow="Conexão" title="Estratégias" count={strategies.length}>
        {strategies.length > 0 ? <StrategyList items={strategies.map(strategyToCard)} emptyMessage="" /> : <EmptySection message="Nenhuma estratégia relacionada a este estilo." />}
      </DimensionSection>
      <DimensionSection
        id="referencias"
        eyebrow="Imagens"
        title="Referências"
        count={references.length}
        action={style.can.update && <AddReferenceButton type="style" slug={style.slug} />}
      >
        <ReferenceGallery items={references.map(referenceToGalleryItem)} groups={groups} emptyMessage="Nenhuma referência adicionada ainda." />
      </DimensionSection>
      {related.length > 0 && (
        <DimensionSection id="relacionados" eyebrow="Conexão" title="Estilos relacionados" count={related.length}>
          <ContentGrid items={related.map(styleToCard)} emptyMessage="" />
        </DimensionSection>
      )}
    </article>
  );
}
