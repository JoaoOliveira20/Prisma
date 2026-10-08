"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { errorState, type FormState } from "@/lib/form";

export async function createTag(_state: FormState, formData: FormData) {
  try {
    await apiRequest("/tags", {
      method: "POST",
      body: JSON.stringify({ name: String(formData.get("name") ?? "").trim() }),
    });
  } catch (error) {
    return errorState(error);
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Tag criada." };
}

export async function renameTag(slug: string, _state: FormState, formData: FormData) {
  try {
    await apiRequest(`/tags/${slug}`, {
      method: "PUT",
      body: JSON.stringify({ name: String(formData.get("name") ?? "").trim() }),
    });
  } catch (error) {
    return errorState(error);
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Tag renomeada." };
}

export async function deleteTag(slug: string) {
  try {
    await apiRequest(`/tags/${slug}`, { method: "DELETE" });
  } catch (error) {
    return errorState(error);
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Tag excluída." };
}
