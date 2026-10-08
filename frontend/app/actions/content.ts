"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { contentPaths } from "@/lib/content";
import type { ContentType, Group, GroupableType } from "@/types/api";
import { buildContentBody, errorState, optionalText, type FormState } from "@/lib/form";

const apiPaths: Record<ContentType, string> = {
  style: "/styles",
  person: "/people",
  strategy: "/strategies",
};

type SavedContent = { slug: string };

async function persist(type: ContentType, slug: string | null, body: FormData): Promise<FormState | SavedContent> {
  try {
    const { data } = await apiRequest<{ data: SavedContent }>(slug ? `${apiPaths[type]}/${slug}` : apiPaths[type], {
      method: "POST",
      body,
    });
    return data;
  } catch (error) {
    return errorState(error);
  }
}

async function saveContent(type: ContentType, slug: string | null, fields: Parameters<typeof buildContentBody>[0], formData: FormData) {
  const result = await persist(type, slug, buildContentBody(fields, formData, slug ? "PUT" : "POST"));

  if (result && "slug" in result) {
    revalidatePath("/", "layout");
    redirect(`${contentPaths[type]}/${result.slug}`);
  }

  return result;
}

const textOf = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();
const listOf = (formData: FormData, name: string) => formData.getAll(name).map(String);

export async function saveStyle(slug: string | null, _state: FormState, formData: FormData) {
  return saveContent("style", slug, {
    name: textOf(formData, "name"),
    summary: optionalText(formData.get("summary")),
    period: optionalText(formData.get("period")),
    origin: optionalText(formData.get("origin")),
    cover_url: optionalText(formData.get("cover_url")),
    history: optionalText(formData.get("history")),
    influences: optionalText(formData.get("influences")),
    characteristics: textOf(formData, "characteristics").split("\n").map((line) => line.trim()).filter(Boolean),
    tags: listOf(formData, "tags"),
  }, formData);
}

export async function savePerson(slug: string | null, _state: FormState, formData: FormData) {
  return saveContent("person", slug, {
    name: textOf(formData, "name"),
    role: optionalText(formData.get("role")),
    summary: optionalText(formData.get("summary")),
    period: optionalText(formData.get("period")),
    origin: optionalText(formData.get("origin")),
    photo_url: optionalText(formData.get("photo_url")),
    biography: optionalText(formData.get("biography")),
    tags: listOf(formData, "tags"),
    styles: listOf(formData, "styles"),
  }, formData);
}

export async function saveStrategy(slug: string | null, _state: FormState, formData: FormData) {
  return saveContent("strategy", slug, {
    name: textOf(formData, "name"),
    category: optionalText(formData.get("category")),
    summary: optionalText(formData.get("summary")),
    cover_url: optionalText(formData.get("cover_url")),
    description: optionalText(formData.get("description")),
    tags: listOf(formData, "tags"),
    styles: listOf(formData, "styles"),
  }, formData);
}

export async function deleteContent(type: ContentType, slug: string) {
  await apiRequest(`${apiPaths[type]}/${slug}`, { method: "DELETE" });
  revalidatePath("/", "layout");
  redirect(contentPaths[type]);
}

export async function setFavorite(type: GroupableType, slug: string, isFavorite: boolean) {
  await apiRequest(`/favorites/${type}/${slug}`, { method: isFavorite ? "POST" : "DELETE" });
  revalidatePath("/", "layout");
}

export async function setGroupMembership(groupId: number, type: GroupableType, slug: string, inGroup: boolean) {
  if (inGroup) {
    await apiRequest(`/groups/${groupId}/items`, { method: "POST", body: JSON.stringify({ type, slug }) });
  } else {
    await apiRequest(`/groups/${groupId}/items/${type}/${slug}`, { method: "DELETE" });
  }
  revalidatePath("/", "layout");
}

export async function createGroup(_state: FormState, formData: FormData) {
  try {
    await apiRequest<{ data: Group }>("/groups", {
      method: "POST",
      body: JSON.stringify({ name: String(formData.get("name") ?? "").trim() }),
    });
  } catch (error) {
    return errorState(error);
  }

  revalidatePath("/grupos");
  return { success: true, message: "Grupo criado." };
}

export async function renameGroup(groupId: number, _state: FormState, formData: FormData) {
  try {
    await apiRequest(`/groups/${groupId}`, {
      method: "PUT",
      body: JSON.stringify({ name: String(formData.get("name") ?? "").trim() }),
    });
  } catch (error) {
    return errorState(error);
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Grupo renomeado." };
}

export async function deleteGroup(groupId: number) {
  await apiRequest(`/groups/${groupId}`, { method: "DELETE" });
  revalidatePath("/", "layout");
  redirect("/grupos");
}
