export type Tag = {
  name: string;
  slug: string;
  usage_count?: number;
  can?: { update: boolean; delete: boolean };
};

export type ReferenceItem = {
  id: number;
  title: string;
  image_url: string;
  source_url: string | null;
  credit: string | null;
  description: string | null;
  created_at?: string | null;
  related?: ReferenceItem[];
  links?: { type: ContentType; slug: string; name: string }[];
  tags?: Pick<Tag, "name" | "slug">[];
  is_favorite: boolean;
  group_ids?: number[];
  can: { update: boolean; delete: boolean };
};

export type Style = {
  slug: string;
  name: string;
  summary: string | null;
  history: string | null;
  influences: string | null;
  characteristics: string[];
  period: string | null;
  origin: string | null;
  cover_url: string | null;
  tags?: Tag[];
  references?: ReferenceItem[];
  references_count?: number;
  related?: Style[];
  people?: Person[];
  people_count?: number;
  strategies?: Strategy[];
  strategies_count?: number;
  has_uploaded_image: boolean;
  is_favorite: boolean;
  group_ids?: number[];
  can: { update: boolean; delete: boolean };
};

export type User = {
  name: string;
  email: string;
};

export type FieldErrors = Record<string, string[]>;

export type Person = {
  slug: string;
  name: string;
  role: string | null;
  summary: string | null;
  biography: string | null;
  period: string | null;
  origin: string | null;
  photo_url: string | null;
  tags?: Tag[];
  styles?: Style[];
  references?: ReferenceItem[];
  references_count?: number;
  has_uploaded_image: boolean;
  is_favorite: boolean;
  group_ids?: number[];
  can: { update: boolean; delete: boolean };
};

export type Strategy = {
  slug: string;
  name: string;
  category: string | null;
  summary: string | null;
  description: string | null;
  cover_url: string | null;
  tags?: Tag[];
  styles?: Style[];
  references?: ReferenceItem[];
  references_count?: number;
  has_uploaded_image: boolean;
  is_favorite: boolean;
  group_ids?: number[];
  can: { update: boolean; delete: boolean };
};

export type Group = {
  id: number;
  name: string;
  is_favorites: boolean;
  previews?: string[];
  items_count: number;
  can: { update: boolean; delete: boolean };
};

export type GroupDetail = Group & {
  styles: Style[];
  people: Person[];
  strategies: Strategy[];
  references: ReferenceItem[];
};

export type ContentType = "style" | "person" | "strategy";

export type GroupableType = ContentType | "reference";

export type PageMeta = {
  current_page: number;
  last_page: number;
  total: number;
};

export type Page<T> = {
  data: T[];
  meta: PageMeta;
};

export type GalleryKind = "reference" | ContentType;

export type GalleryItem = {
  key: string;
  kind: GalleryKind;
  id: number | null;
  slug: string | null;
  title: string;
  description: string | null;
  image_url: string;
  created_at?: string | null;
  credit?: string | null;
  source_url?: string | null;
  links?: ReferenceItem["links"];
  tags?: ReferenceItem["tags"];
  is_favorite?: boolean;
  group_ids?: number[];
  can: { update: boolean; delete: boolean };
};

export type LinkOption = { value: string; label: string };

export type EntityOption = LinkOption & { type: ContentType };
