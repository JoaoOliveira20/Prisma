import type { Metadata } from "next";
import { EntityReferences } from "@/components/references/EntityReferences";
import { getPerson } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/pessoas/[slug]/referencias">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPerson(slug);
  return { title: `Referências · ${item.name}` };
}

export default async function PersonReferencesPage({ params, searchParams }: PageProps<"/pessoas/[slug]/referencias">) {
  const { slug } = await params;
  const item = await getPerson(slug);
  return <EntityReferences type="person" slug={slug} name={item.name} canUpdate={item.can.update} searchParams={searchParams} />;
}
