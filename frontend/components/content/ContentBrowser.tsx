import { FilterContext } from "@/components/layout/FilterContext";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { contentPaths, personToCard, strategyToCard, styleToCard } from "@/lib/content";
import { getPeoplePage, getStrategiesPage, getStyle, getStylesPage, getTags } from "@/lib/data";
import { redirectIfBeyondLastPage } from "@/lib/pagination";
import type { ContentType } from "@/types/api";
import { ContentSearch } from "./ContentSearch";
import { ContentGrid, type GridLayout } from "./ContentGrid";
import { StrategyList } from "./StrategyList";

const labels: Record<ContentType, { eyebrow: string; title: string; lede: string; create: string; empty: string; first: string; search: string; layout: GridLayout | "list" }> = {
  style: {
    eyebrow: "Dimensão · Estéticas",
    title: "Estilos",
    lede: "Movimentos, estéticas e linguagens visuais, cada um com sua história, suas pessoas e suas imagens.",
    create: "Novo estilo",
    empty: "Ainda não há estilos cadastrados.",
    first: "Criar o primeiro estilo",
    search: "Buscar por nome, período ou origem",
    layout: "rhythm",
  },
  person: {
    eyebrow: "Dimensão · Autores",
    title: "Pessoas",
    lede: "Designers, artistas e pensadores que moldaram a história visual.",
    create: "Nova pessoa",
    empty: "Ainda não há pessoas cadastradas.",
    first: "Cadastrar a primeira pessoa",
    search: "Buscar por nome, atuação ou origem",
    layout: "portraits",
  },
  strategy: {
    eyebrow: "Dimensão · Conceitos",
    title: "Estratégias",
    lede: "Princípios, práticas e metodologias: as ideias por trás das formas.",
    create: "Nova estratégia",
    empty: "Ainda não há estratégias cadastradas.",
    first: "Criar a primeira estratégia",
    search: "Buscar por nome ou categoria",
    layout: "list",
  },
};

async function loadCards(type: ContentType, filters: { q?: string; tag?: string; style?: string; page?: number; sort?: "name" | "recent" }) {
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
  searchParams: Promise<{ tag?: string; q?: string; style?: string; page?: string; sort?: string }>;
};

export async function ContentBrowser({ type, searchParams }: ContentBrowserProps) {
  const { tag, q, style: styleParam, page, sort: sortParam } = await searchParams;
  const sort = sortParam === "recent" ? "recent" : "name";
  const style = type !== "style" && typeof styleParam === "string" && styleParam !== "" ? styleParam : undefined;
  const [{ items, meta }, tags, contextStyle] = await Promise.all([
    loadCards(type, { tag, q, style, sort, page: Number(page) || undefined }),
    getTags(),
    style ? getStyle(style) : undefined,
  ]);
  const sortParams = { tag, q, style, sort: sort === "recent" ? sort : undefined };
  const path = contentPaths[type];
  redirectIfBeyondLastPage(meta, path, sortParams);
  const isFiltered = Boolean(tag || q || style);
  const label = labels[type];
  const emptyMessage = isFiltered ? "Nada encontrado com esses filtros." : label.empty;
  const clearHref = style ? `${path}?style=${style}` : path;
  const emptyAction = isFiltered ? (
    <Link href={clearHref} className="underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-text text-sm text-text-muted hover:text-text">Limpar busca e filtros</Link>
  ) : (
    <LinkButton href={`${path}/novo`}>{label.first}</LinkButton>
  );

  return (
    <>
      <PageHeader eyebrow={label.eyebrow} title={label.title} lede={label.lede} actions={<LinkButton href={`${path}/novo`} variant="secondary">{label.create}</LinkButton>} />
      {contextStyle && <FilterContext kind="estilo" name={contextStyle.name} openHref={`${contentPaths.style}/${contextStyle.slug}`} clearHref={path} />}
      <ContentSearch label={`Buscar em ${label.title.toLowerCase()}`} placeholder={label.search} tags={tags} withSort>
      <div key={JSON.stringify(sortParams) + meta.current_page} className="page-x results-in pt-12">
        <p aria-live="polite" className="eyebrow tabular mb-8">{meta.total} {meta.total === 1 ? "registro" : "registros"}</p>
        {label.layout === "list" ? (
          <StrategyList items={items} emptyMessage={emptyMessage} emptyAction={emptyAction} />
        ) : (
          <ContentGrid items={items} layout={label.layout} headingLevel={2} emptyMessage={emptyMessage} emptyAction={emptyAction} />
        )}
        <Pagination meta={meta} basePath={path} params={sortParams} />
      </div>
      </ContentSearch>
    </>
  );
}
