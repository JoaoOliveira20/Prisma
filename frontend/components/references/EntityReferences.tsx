import Link from "next/link";
import { ListSearch } from "@/components/content/ListSearch";
import { Pagination } from "@/components/ui/Pagination";
import { contentPaths } from "@/lib/content";
import { getGroups, getImagesPage } from "@/lib/data";
import { redirectIfBeyondLastPage } from "@/lib/pagination";
import type { ContentType } from "@/types/api";
import { AddReferenceButton } from "./AddReferenceButton";
import { ReferenceGallery } from "./ReferenceGallery";

const typeLabels: Record<ContentType, string> = { style: "Estilos", person: "Pessoas", strategy: "Estratégias" };

type EntityReferencesProps = {
  type: ContentType;
  slug: string;
  name: string;
  canUpdate: boolean;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function EntityReferences({ type, slug, name, canUpdate, searchParams }: EntityReferencesProps) {
  const { q, page } = await searchParams;
  const query = typeof q === "string" && q !== "" ? q : undefined;
  const basePath = `${contentPaths[type]}/${slug}/referencias`;
  const [{ data, meta }, groups] = await Promise.all([
    getImagesPage({ q: query, kind: "reference", [type]: slug, page: Number(page) || undefined }),
    getGroups(),
  ]);
  redirectIfBeyondLastPage(meta, basePath, { q: query });

  return (
    <>
      <header className="page-x pb-8 pt-10">
        <nav aria-label="Trilha" className="text-sm text-text-muted">
          <Link href={contentPaths[type]} className="underline-offset-4 hover:text-text hover:underline">{typeLabels[type]}</Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <Link href={`${contentPaths[type]}/${slug}`} className="underline-offset-4 hover:text-text hover:underline">{name}</Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <span className="text-text">Referências</span>
        </nav>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="spectrum-rule" aria-hidden="true" />
              <p className="eyebrow">Referências</p>
            </div>
            <h1 className="mt-5 font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">{name}</h1>
          </div>
          {canUpdate && <AddReferenceButton type={type} slug={slug} />}
        </div>
      </header>
      <div className="page-x border-y border-border py-5">
        <ListSearch basePath={basePath} query={query} placeholder="Buscar por título, descrição ou crédito" withSort={false} />
      </div>
      <div key={`${query}-${meta.current_page}`} className="page-x results-in pt-12">
        <p className="eyebrow tabular mb-8">{meta.total} {meta.total === 1 ? "referência" : "referências"}</p>
        <ReferenceGallery selectable items={data} groups={groups} emptyMessage={query ? "Nenhuma referência encontrada." : "Nenhuma referência adicionada ainda."} />
        <Pagination meta={meta} basePath={basePath} params={{ q: query }} />
      </div>
    </>
  );
}
