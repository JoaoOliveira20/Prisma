"use server";

import { redirect } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { clearToken, setToken } from "@/lib/session";
import type { FormState } from "@/lib/form";

async function authenticate(path: string, payload: Record<string, FormDataEntryValue | null>): Promise<FormState> {
  try {
    const { token, expires_in: expiresIn } = await apiRequest<{ token: string; expires_in: number }>(path, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await setToken(token, expiresIn);
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, errors: error.fieldErrors };
    }
    return { message: "Não foi possível conectar ao servidor." };
  }
  redirect("/");
}

export async function login(_state: FormState, formData: FormData) {
  return authenticate("/auth/login", {
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export async function register(_state: FormState, formData: FormData) {
  return authenticate("/auth/register", {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    password_confirmation: formData.get("password_confirmation"),
  });
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {}
  await clearToken();
  redirect("/login");
}
