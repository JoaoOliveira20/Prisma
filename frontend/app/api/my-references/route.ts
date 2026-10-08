import { NextResponse } from "next/server";
import { ApiError, apiRequest } from "@/lib/api";
import type { GalleryItem, Page } from "@/types/api";

export async function GET() {
  try {
    const { data } = await apiRequest<Page<GalleryItem>>("/images?kind=reference&mine=1&per_page=100");
    return NextResponse.json({ references: data });
  } catch (error) {
    return NextResponse.json({ message: "Falha ao carregar as referências." }, { status: error instanceof ApiError ? error.status : 502 });
  }
}
