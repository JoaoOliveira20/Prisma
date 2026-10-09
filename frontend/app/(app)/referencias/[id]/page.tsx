import type { Metadata } from "next";
import Link from "next/link";
import { FadeImage } from "@/components/content/FadeImage";
import { DimensionSection } from "@/components/layout/DimensionSection";
import { ReferenceDetailActions } from "@/components/references/ReferenceDetailActions";
import { ReferenceGallery } from "@/components/references/ReferenceGallery";
import { TagChips } from "@/components/references/TagChips";
import { EmptySection } from "@/components/ui/EmptySection";
import { contentPaths, contentTypeLabels, formatDate, referenceToGalleryItem } from "@/lib/content";
import { getGroups, getReference } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/referencias/[id]">): Promise<Metadata> {
  const { id } = await params;
  const reference = await getReference(id);
  return { title: reference.title };
}

export default async function ReferenceDetailPage({ params }: PageProps<"/referencias/[id]">) {
  const { id } = await params;
  const [reference, groups] = await Promise.all([getReference(id), getGroups()]);
  const item = referenceToGalleryItem(reference);
  const links = reference.links ?? [];
  const related = reference.related ?? [];
  const memberships = groups.filter((group) => reference.group_ids?.includes(group.id));
  const sourceHost = reference.source_url ? new URL(reference.source_url).hostname.replace(/^www\./, "") : null;

  return (
    <article>
      <header className="page-x pt-10">
        <nav aria-label="Trilha" className="text-sm text-text-muted">
          <Link href="/referencias" className="underline-offset-4 hover:text-text hover:underline">Referências</Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <span className="text-text">{reference.title}</span>
        </nav>
      </header>

      <section className="page-x pb-16 pt-8 lg:grid lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-8">
          <div className="bg-surface">
            <FadeImage src={reference.image_url} alt={reference.title} width={1600} height={1200} unoptimized priority className="mx-auto h-auto max-h-[80vh] w-full object-contain" />
          </div>
        </div>
        <div className="mt-8 flex flex-col lg:col-span-4 lg:mt-0 lg:self-start lg:pt-2">
          <div className="flex items-center gap-3">
            <span className="spectrum-rule" aria-hidden="true" />
            <p className="eyebrow">Referência{reference.created_at && <span className="tabular"> · {formatDate(reference.created_at)}</span>}</p>
          </div>
          <h1 className="mt-5 break-words font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">{reference.title}</h1>
          {reference.description && <p className="mt-5 max-w-md leading-relaxed text-text-muted">{reference.description}</p>}
          {(reference.credit || sourceHost) && (
            <dl className="mt-7 grid max-w-md grid-cols-2 gap-x-8 border-t border-border">
              {reference.credit && (
                <div className="border-b border-border py-3">
                  <dt className="eyebrow">Crédito</dt>
                  <dd className="mt-1 text-sm">{reference.credit}</dd>
                </div>
              )}
              {reference.source_url && sourceHost && (
                <div className="border-b border-border py-3">
                  <dt className="eyebrow">Fonte</dt>
                  <dd className="mt-1 text-sm">
                    <a href={reference.source_url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">{sourceHost} ↗</a>
                  </dd>
                </div>
              )}
            </dl>
          )}
          <div className="mt-6">
            <TagChips tags={reference.tags} />
          </div>
          <div className="mt-8">
            <ReferenceDetailActions item={item} groups={groups} />
          </div>
        </div>
      </section>

      <DimensionSection id="faz-parte" eyebrow="Dimensões" title="Faz parte de" count={links.length}>
        {links.length === 0 ? (
          <EmptySection message="Esta imagem ainda não está ligada a nenhum estilo, pessoa ou estratégia." />
        ) : (
          <ul className="border-t border-border">
            {links.map((link) => (
              <li key={`${link.type}-${link.slug}`} className="border-b border-border">
                <Link href={`${contentPaths[link.type]}/${link.slug}`} className="group flex items-baseline justify-between gap-6 py-5">
                  <span className="min-w-0">
                    <span className="eyebrow block">{contentTypeLabels[link.type]}</span>
                    <span className="mt-1 block break-words font-serif text-3xl leading-tight transition-transform duration-300 group-hover:translate-x-1 sm:text-4xl">{link.name}</span>
                  </span>
                  <span aria-hidden="true" className="text-2xl text-text-muted transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {memberships.length > 0 && (
          <p className="mt-8 text-sm text-text-muted">
            Nas suas coleções:{" "}
            {memberships.map((group, index) => (
              <span key={group.id}>
                {index > 0 && ", "}
                <Link href={group.is_favorites ? "/favoritos" : `/grupos/${group.id}`} className="text-text underline decoration-border-strong underline-offset-4 hover:decoration-text">{group.name}</Link>
              </span>
            ))}
          </p>
        )}
      </DimensionSection>

      {related.length > 0 && (
        <DimensionSection id="relacionadas" eyebrow="Descoberta" title="Mais como esta" count={related.length}>
          <ReferenceGallery items={related.map(referenceToGalleryItem)} groups={groups} />
        </DimensionSection>
      )}
    </article>
  );
}
