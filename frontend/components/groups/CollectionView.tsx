import { LinkButton } from "@/components/ui/Button";
import { ContentGrid } from "@/components/content/ContentGrid";
import { StrategyList } from "@/components/content/StrategyList";
import { Section } from "@/components/layout/Section";
import { ReferenceGallery } from "@/components/references/ReferenceGallery";
import { personToCard, referenceToGalleryItem, strategyToCard, styleToCard } from "@/lib/content";
import type { Group, GroupDetail } from "@/types/api";

type CollectionViewProps = {
  group: GroupDetail;
  groups: Group[];
  emptyMessage: string;
};

export function CollectionView({ group, groups, emptyMessage }: CollectionViewProps) {
  const isEmpty = group.items_count === 0;

  return (
    <div className="page-x space-y-20 pt-12">
      {isEmpty && (
        <div>
          <p className="max-w-lg font-serif text-2xl leading-snug text-text-muted">{emptyMessage}</p>
          <LinkButton href="/explorar" variant="secondary" className="mt-8">Explorar o arquivo</LinkButton>
        </div>
      )}
      {group.styles.length > 0 && (
        <Section id="collection-styles" title="Estilos" count={group.styles.length}>
          <ContentGrid items={group.styles.map(styleToCard)} layout="rhythm" emptyMessage="" />
        </Section>
      )}
      {group.references.length > 0 && (
        <Section id="collection-references" title="Referências" count={group.references.length}>
          <ReferenceGallery items={group.references.map(referenceToGalleryItem)} groups={groups} />
        </Section>
      )}
      {group.people.length > 0 && (
        <Section id="collection-people" title="Pessoas" count={group.people.length}>
          <ContentGrid items={group.people.map(personToCard)} layout="portraits" emptyMessage="" />
        </Section>
      )}
      {group.strategies.length > 0 && (
        <Section id="collection-strategies" title="Estratégias" count={group.strategies.length}>
          <StrategyList items={group.strategies.map(strategyToCard)} emptyMessage="" />
        </Section>
      )}
    </div>
  );
}
