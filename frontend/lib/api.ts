import { redirect } from "next/navigation";
import type { FieldErrors } from "@/types/api";
import { getToken } from "./session";

const API_URL = process.env.API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: FieldErrors = {},
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, body.message ?? "Erro inesperado.", body.errors);
  }

  return body as T;
}

export async function apiRequestOrLogin<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await apiRequest<T>(path, init);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }
}
