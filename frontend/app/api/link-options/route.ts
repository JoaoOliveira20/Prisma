import { NextResponse } from "next/server";
import { ApiError, apiRequest } from "@/lib/api";
import type { LinkOption } from "@/types/api";

type Entity = { slug: string; name: string; can: { update: boolean } };

const sources = [
  { type: "style", path: "/styles", key: "styles" },
  { type: "person", path: "/people", key: "people" },
  { type: "strategy", path: "/strategies", key: "strategies" },
] as const;

export async function GET() {
  try {
    const responses = await Promise.all(sources.map((source) => apiRequest<{ data: Entity[] }>(`${source.path}?per_page=100`)));
    const options = Object.fromEntries(
      sources.map((source, index) => [
        source.key,
        responses[index].data
          .filter((item) => item.can.update)
          .map<LinkOption>((item) => ({ value: `${source.type}:${item.slug}`, label: item.name })),
      ]),
    );
    return NextResponse.json(options);
  } catch (error) {
    return NextResponse.json({ message: "Falha ao carregar as opções." }, { status: error instanceof ApiError ? error.status : 502 });
  }
}
