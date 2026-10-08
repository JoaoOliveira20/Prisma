import { NextResponse, type NextRequest } from "next/server";
import { ApiError, apiRequest } from "@/lib/api";
import { contentPaths } from "@/lib/content";

type SearchHit = {
  href: string;
  name: string;
  subtitle: string | null;
  imageUrl: string | null;
};

type Source = {
  label: string;
  path: string;
  toHit: (item: Record<string, unknown> & { slug: string; name: string }) => SearchHit;
};

const text = (value: unknown) => (typeof value === "string" ? value : null);

const sources: Source[] = [
  {
    label: "Estilos",
    path: "/styles",
    toHit: (item) => ({ href: `${contentPaths.style}/${item.slug}`, name: item.name, subtitle: text(item.period), imageUrl: text(item.cover_url) }),
  },
  {
    label: "Pessoas",
    path: "/people",
    toHit: (item) => ({ href: `${contentPaths.person}/${item.slug}`, name: item.name, subtitle: text(item.role), imageUrl: text(item.photo_url) }),
  },
  {
    label: "Estratégias",
    path: "/strategies",
    toHit: (item) => ({ href: `${contentPaths.strategy}/${item.slug}`, name: item.name, subtitle: text(item.category), imageUrl: text(item.cover_url) }),
  },
  {
    label: "Referências",
    path: "/references",
    toHit: (item) => {
      const title = text(item.title) ?? "";
      return { href: `/referencias?q=${encodeURIComponent(title)}`, name: title, subtitle: text(item.credit), imageUrl: text(item.image_url) };
    },
  },
  {
    label: "Grupos",
    path: "/groups",
    toHit: (item) => ({ href: `/grupos/${item.id}`, name: item.name, subtitle: `${item.items_count} itens`, imageUrl: null }),
  },
  {
    label: "Tags",
    path: "/tags",
    toHit: (item) => ({ href: `/explorar?tag=${item.slug}`, name: item.name, subtitle: `${item.usage_count} conteúdos`, imageUrl: null }),
  },
];

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q === "") {
    return NextResponse.json({ groups: [] });
  }

  try {
    const responses = await Promise.all(
      sources.map((source) => apiRequest<{ data: never[] }>(`${source.path}?${new URLSearchParams({ q })}`)),
    );
    const groups = sources
      .map((source, index) => ({
        label: source.label,
        items: responses[index].data.slice(0, 5).map(source.toHit),
      }))
      .filter((group) => group.items.length > 0);

    return NextResponse.json({ groups });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    return NextResponse.json({ message: "Falha na pesquisa." }, { status });
  }
}
