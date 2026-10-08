import type { ContentType, GalleryItem, GalleryKind, Person, ReferenceItem, Strategy, Style, Tag } from "@/types/api";

export type ContentCardData = {
  type: ContentType;
  slug: string;
  href: string;
  name: string;
  meta: string;
  summary: string | null;
  imageUrl: string | null;
  tags: Tag[];
  isFavorite: boolean;
};

const joinMeta = (...parts: (string | null)[]) => parts.filter(Boolean).join(" · ");

export const contentTypeLabels: Record<ContentType, string> = {
  style: "Estilo",
  person: "Pessoa",
  strategy: "Estratégia",
};

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

export const contentPaths: Record<ContentType, string> = {
  style: "/estilos",
  person: "/pessoas",
  strategy: "/estrategias",
};

export function styleToCard(style: Style): ContentCardData {
  return {
    type: "style",
    slug: style.slug,
    href: `${contentPaths.style}/${style.slug}`,
    name: style.name,
    meta: joinMeta(style.period, style.origin),
    summary: style.summary,
    imageUrl: style.cover_url,
    tags: style.tags ?? [],
    isFavorite: style.is_favorite,
  };
}

export function personToCard(person: Person): ContentCardData {
  return {
    type: "person",
    slug: person.slug,
    href: `${contentPaths.person}/${person.slug}`,
    name: person.name,
    meta: joinMeta(person.role, person.period),
    summary: person.summary,
    imageUrl: person.photo_url,
    tags: person.tags ?? [],
    isFavorite: person.is_favorite,
  };
}

export function strategyToCard(strategy: Strategy): ContentCardData {
  return {
    type: "strategy",
    slug: strategy.slug,
    href: `${contentPaths.strategy}/${strategy.slug}`,
    name: strategy.name,
    meta: strategy.category ?? "",
    summary: strategy.summary,
    imageUrl: strategy.cover_url,
    tags: strategy.tags ?? [],
    isFavorite: strategy.is_favorite,
  };
}

export const galleryKindLabels: Record<GalleryKind, string> = {
  reference: "Referência",
  style: "Estilo",
  person: "Pessoa",
  strategy: "Estratégia",
};

export function referenceToGalleryItem(reference: ReferenceItem): GalleryItem {
  return {
    key: `reference:${reference.id}`,
    kind: "reference",
    id: reference.id,
    slug: null,
    title: reference.title,
    description: reference.description,
    image_url: reference.image_url,
    created_at: reference.created_at,
    credit: reference.credit,
    source_url: reference.source_url,
    links: reference.links,
    tags: reference.tags,
    is_favorite: reference.is_favorite,
    group_ids: reference.group_ids,
    can: reference.can,
  };
}
