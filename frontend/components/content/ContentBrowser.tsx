import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { personToCard, styleToCard, strategyToCard, contentPaths } from "@/lib/content";
import { redirectIfBeyondLastPage } from "@/lib/pagination";
import { getPeoplePage, getStrategiesPage, getStylesPage, getTags } from "@/lib/data";
import type { ContentType } from "@/types/api";
import { Pagination } from "@/components/ui/Pagination";
import { ListSearch } from "./ListSearch";
import { ContentFilters } from "./ContentFilters";
import { ContentGrid } from "./ContentGrid";

const labels: Record<ContentType, { title: string; subtitle: string; create: string; empty: string; first: string; search: string }> = {
  style: {
    title: "Estilos",
    subtitle: "Estéticas, movimentos e linguagens visuais.",
    create: "Novo estilo",
    empty: "Ainda não há estilos cadastrados.",
    first: "Criar o primeiro estilo",
    search: "Buscar por nome, período ou origem",
  },
  person: {
    title: "Pessoas",
    subtitle: "Designers, artistas e pensadores que moldaram a história visual.",
    create: "Nova pessoa",
    empty: "Ainda não há pessoas cadastradas.",
    first: "Cadastrar a primeira pessoa",
    search: "Buscar por nome, atuação ou origem",
  },
  strategy: {
    title: "Estratégias",
    subtitle: "Princípios, práticas e metodologias de criação.",
    create: "Nova estratégia",
    empty: "Ainda não há estratégias cadastradas.",
    first: "Criar a primeira estratégia",
    search: "Buscar por nome ou categoria",
  },
};

async function loadCards(type: ContentType, filters: { q?: string; tag?: string; page?: number; sort?: "name" | "recent" }) {
  if (type === "style") {
    const { data, meta } = await getStylesPage(filters);
    return { items: data.map(styleToCard), meta };
  }
  if (type === "person") {
    const { data, meta } = await getPeoplePage(filters);
    return { items: data.map(personToCard), meta };
  }
  const { data, meta } = await getStrategiesPage(filters);
  return { items: data.map(strategyToCard), meta };
}

type ContentBrowserProps = {
  type: ContentType;
  searchParams: Promise<{ tag?: string; q?: string; page?: string; sort?: string }>;
};

export async function ContentBrowser({ type, searchParams }: ContentBrowserProps) {
  const { tag, q, page, sort: sortParam } = await searchParams;
  const sort = sortParam === "recent" ? "recent" : "name";
  const [{ items, meta }, tags] = await Promise.all([loadCards(type, { tag, q, sort, page: Number(page) || undefined }), getTags()]);
  const sortParams = { tag, q, sort: sort === "recent" ? sort : undefined };
  const path = contentPaths[type];
  redirectIfBeyondLastPage(meta, path, sortParams);
  const isFiltered = Boolean(tag || q);
  const label = labels[type];

  return (
    <>
      <PageHeader
        title={label.title}
        subtitle={label.subtitle}
        actions={<LinkButton href={`${path}/novo`} className="shrink-0">{label.create}</LinkButton>}
      />
      <ListSearch basePath={path} query={q} tag={tag} sort={sort} placeholder={label.search} />
      <ContentFilters basePath={path} tags={tags} activeTag={tag} query={q} sort={sort} />
      <div className="px-5 pb-12 sm:px-10">
        <ContentGrid
          items={items}
          emptyMessage={isFiltered ? "Nada encontrado com esses filtros." : label.empty}
          emptyAction={!isFiltered && <LinkButton href={`${path}/novo`}>{label.first}</LinkButton>}
        />
        <Pagination meta={meta} basePath={path} params={sortParams} />
      </div>
    </>
  );
}
