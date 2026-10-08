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
  const { page, q, kind, style, mine, nova } = await searchParams;
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
      <PageHeader
        eyebrow="Dimensão · Imagens"
        title="Referências"
        lede="Tudo o que o arquivo guarda em imagem: referências, capas de estilos e estratégias e retratos de pessoas."
        actions={<NewReferenceButton defaultOpen={nova === "1"} />}
      />
      <ImageFilters kind={kindFilter} q={query} style={styleFilter} mine={onlyMine} styles={styles} />
      <div className="page-x pt-12">
        <p className="eyebrow tabular mb-8">{meta.total} {meta.total === 1 ? "imagem" : "imagens"}</p>
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
