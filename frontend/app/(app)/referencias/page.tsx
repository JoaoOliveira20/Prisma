import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageFilters } from "@/components/references/ImageFilters";
import { NewReferenceButton } from "@/components/references/NewReferenceButton";
import { ReferenceGallery } from "@/components/references/ReferenceGallery";
import { Pagination } from "@/components/ui/Pagination";
import { getGroups, getImagesPage, getStyles } from "@/lib/data";
import { redirectIfBeyondLastPage } from "@/lib/pagination";

export const metadata: Metadata = { title: "Referências" };

const validKinds = ["reference", "style", "person", "strategy"];

export default async function ReferencesPage({ searchParams }: PageProps<"/referencias">) {
  const { page, q, kind, style, mine } = await searchParams;
  const query = typeof q === "string" && q !== "" ? q : undefined;
  const kindFilter = typeof kind === "string" && validKinds.includes(kind) ? kind : undefined;
  const styleFilter = typeof style === "string" && style !== "" ? style : undefined;
  const onlyMine = mine === "1";

  const [{ data, meta }, groups, styles] = await Promise.all([
    getImagesPage({ q: query, kind: kindFilter, style: styleFilter, mine: onlyMine, page: Number(page) || undefined }),
    getGroups(),
    getStyles({ perPage: 100 }),
  ]);
  const params = { q: query, kind: kindFilter, style: styleFilter, mine: onlyMine ? "1" : undefined };
  redirectIfBeyondLastPage(meta, "/referencias", params);
  const filtered = Boolean(query || kindFilter || styleFilter || onlyMine);

  return (
    <>
      <PageHeader title="Referências" subtitle="Todas as imagens do sistema: referências, capas de estilos e estratégias e fotos de pessoas." actions={<NewReferenceButton />} />
      <ImageFilters kind={kindFilter} q={query} style={styleFilter} mine={onlyMine} styles={styles} />
      <div className="px-5 pb-12 sm:px-10">
        <ReferenceGallery
          items={data}
          groups={groups}
          emptyMessage={filtered ? "Nenhuma imagem encontrada com esses filtros." : "Ainda não há imagens. Adicione uma referência ou envie capas aos seus conteúdos."}
        />
        <Pagination meta={meta} basePath="/referencias" params={params} />
      </div>
    </>
  );
}
