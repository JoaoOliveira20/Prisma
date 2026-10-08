import type { Metadata } from "next";
import { EntityReferences } from "@/components/references/EntityReferences";
import { getStyle } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/estilos/[slug]/referencias">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getStyle(slug);
  return { title: `Referências · ${item.name}` };
}

export default async function StyleReferencesPage({ params, searchParams }: PageProps<"/estilos/[slug]/referencias">) {
  const { slug } = await params;
  const item = await getStyle(slug);
  return <EntityReferences type="style" slug={slug} name={item.name} canUpdate={item.can.update} searchParams={searchParams} />;
}
