import { NextResponse } from "next/server";
import { ApiError, apiRequest } from "@/lib/api";
import type { Tag } from "@/types/api";

export async function GET() {
  try {
    const { data } = await apiRequest<{ data: Tag[] }>("/tags");
    return NextResponse.json({ tags: data.map((tag) => ({ value: tag.slug, label: tag.name })) });
  } catch (error) {
    return NextResponse.json({ message: "Falha ao carregar as tags." }, { status: error instanceof ApiError ? error.status : 502 });
  }
}
