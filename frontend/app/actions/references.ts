"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiRequest } from "@/lib/api";
import { errorState, optionalText, type FormState } from "@/lib/form";
import type { ContentType } from "@/types/api";

function linksOf(formData: FormData) {
  return formData.getAll("links").map((link) => {
    const [type, slug] = String(link).split(":");
    return { type, slug };
  });
}

export async function createReference(_state: FormState, formData: FormData) {
  const body = new FormData();
  body.set("title", String(formData.get("title") ?? "").trim());

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    body.set("image", image);
  } else {
    body.set("image_url", String(formData.get("image_url") ?? "").trim());
  }

  for (const field of ["description", "source_url", "credit"] as const) {
    const value = optionalText(formData.get(field));
    if (value) body.set(field, value);
  }

  linksOf(formData).forEach(({ type, slug }, index) => {
    body.set(`links[${index}][type]`, type);
    body.set(`links[${index}][slug]`, slug);
  });

  try {
    await apiRequest("/references", { method: "POST", body });
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { message: "Você só pode vincular referências a conteúdos que criou." };
    }
    return errorState(error);
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Referência adicionada." };
}

export async function updateReference(referenceId: number, _state: FormState, formData: FormData) {
  try {
    await apiRequest(`/references/${referenceId}`, {
      method: "PUT",
      body: JSON.stringify({
        title: String(formData.get("title") ?? "").trim(),
        credit: optionalText(formData.get("credit")),
        description: optionalText(formData.get("description")),
        source_url: optionalText(formData.get("source_url")),
        links: linksOf(formData),
      }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { message: "Você só pode vincular referências a conteúdos que criou." };
    }
    return errorState(error);
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Referência atualizada." };
}

export async function linkReferences(type: ContentType, slug: string, referenceIds: number[]) {
  try {
    for (const id of referenceIds) {
      await apiRequest(`/references/${id}/links`, { method: "POST", body: JSON.stringify({ type, slug }) });
    }
  } catch (error) {
    return errorState(error);
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Referências vinculadas." };
}

export async function removeReference(referenceId: number) {
  await apiRequest(`/references/${referenceId}`, { method: "DELETE" });
  revalidatePath("/", "layout");
}
