import type { FieldErrors } from "@/types/api";
import { ApiError } from "./api";

export type FormState = {
  message?: string;
  success?: boolean;
  errors?: FieldErrors;
} | null;

export function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text === "" ? null : text;
}

export function errorState(error: unknown): FormState {
  if (error instanceof ApiError) {
    return { message: error.message, errors: error.fieldErrors };
  }
  return { message: "Não foi possível conectar ao servidor." };
}

type MultipartFields = Record<string, string | string[] | null>;

export function buildContentBody(fields: MultipartFields, formData: FormData, method: "POST" | "PUT") {
  const body = new FormData();
  if (method === "PUT") body.set("_method", "PUT");

  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      if (value.length === 0) body.append(key, "");
      value.forEach((item) => body.append(`${key}[]`, item));
    } else {
      body.set(key, value ?? "");
    }
  }

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) body.set("image", image);
  if (formData.get("remove_image") === "on") body.set("remove_image", "1");

  return body;
}
