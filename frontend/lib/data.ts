import { notFound } from "next/navigation";
import type { GalleryItem, Group, Page, ReferenceItem, GroupDetail, Person, Strategy, Style, Tag, User } from "@/types/api";
import { ApiError, apiRequest, apiRequestOrLogin } from "./api";

type ListFilters = {
  q?: string;
  tag?: string;
  style?: string;
  sort?: "name" | "recent";
  page?: number;
  perPage?: number;
};

export async function getCurrentUser() {
  const { user } = await apiRequestOrLogin<{ user: User }>("/auth/me");
  return user;
}

export async function getOptionalUser() {
  try {
    const { user } = await apiRequest<{ user: User }>("/auth/me");
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

async function getPage<T>(path: string, filters: ListFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.style) params.set("style", filters.style);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.perPage) params.set("per_page", String(filters.perPage));

  return apiRequestOrLogin<Page<T>>(`${path}?${params}`);
}

async function getOne<T>(path: string) {
  try {
    const { data } = await apiRequestOrLogin<{ data: T }>(path);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export const getStylesPage = (filters: ListFilters = {}) => getPage<Style>("/styles", filters);
export const getPeoplePage = (filters: ListFilters = {}) => getPage<Person>("/people", filters);
export const getStrategiesPage = (filters: ListFilters = {}) => getPage<Strategy>("/strategies", filters);
export const getReferencesPage = (filters: ListFilters = {}) => getPage<ReferenceItem>("/references", filters);

export const getStyles = async (filters: ListFilters = {}) => (await getStylesPage(filters)).data;
export const getPeople = async (filters: ListFilters = {}) => (await getPeoplePage(filters)).data;
export const getStrategies = async (filters: ListFilters = {}) => (await getStrategiesPage(filters)).data;

export const getStyle = (slug: string) => getOne<Style>(`/styles/${encodeURIComponent(slug)}`);
export const getPerson = (slug: string) => getOne<Person>(`/people/${encodeURIComponent(slug)}`);
export const getStrategy = (slug: string) => getOne<Strategy>(`/strategies/${encodeURIComponent(slug)}`);

type ImageFilters = {
  q?: string;
  kind?: string;
  style?: string;
  tag?: string;
  group?: number;
  sort?: string;
  person?: string;
  strategy?: string;
  page?: number;
  perPage?: number;
};

export async function getImagesPage(filters: ImageFilters = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.style) params.set("style", filters.style);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.group) params.set("group", String(filters.group));
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.person) params.set("person", filters.person);
  if (filters.strategy) params.set("strategy", filters.strategy);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.perPage) params.set("per_page", String(filters.perPage));

  return apiRequestOrLogin<Page<GalleryItem>>(`/images?${params}`);
}

export const getReference = (id: string) => getOne<ReferenceItem>(`/references/${encodeURIComponent(id)}`);

export async function getGroups() {
  const { data } = await apiRequestOrLogin<{ data: Group[] }>("/groups");
  return data;
}

export const getGroup = (id: string) => getOne<GroupDetail>(`/groups/${encodeURIComponent(id)}`);

export async function getTags() {
  const { data } = await apiRequestOrLogin<{ data: Tag[] }>("/tags");
  return data;
}
