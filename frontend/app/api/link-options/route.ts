import { NextResponse, type NextRequest } from "next/server";
import { ApiError, apiRequest } from "@/lib/api";
import type { EntityOption } from "@/types/api";

type Entity = { slug: string; name: string; can: { update: boolean } };

const sources = [
  { type: "style", path: "/styles" },
  { type: "person", path: "/people" },
  { type: "strategy", path: "/strategies" },
] as const;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.slice(0, 120) ?? "";

  try {
    const responses = await Promise.all(
      sources.map((source) => apiRequest<{ data: Entity[] }>(`${source.path}?per_page=8&q=${encodeURIComponent(query)}`)),
    );
    const options = sources.flatMap((source, index) =>
      responses[index].data
        .filter((item) => item.can.update)
        .map<EntityOption>((item) => ({ value: `${source.type}:${item.slug}`, label: item.name, type: source.type })),
    );
    return NextResponse.json({ options });
  } catch (error) {
    return NextResponse.json({ message: "Falha ao carregar as opções." }, { status: error instanceof ApiError ? error.status : 502 });
  }
}
