import type { Metadata } from "next";
import { EntityReferences } from "@/components/references/EntityReferences";
import { getStrategy } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/estrategias/[slug]/referencias">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getStrategy(slug);
  return { title: `Referências · ${item.name}` };
}

export default async function StrategyReferencesPage({ params, searchParams }: PageProps<"/estrategias/[slug]/referencias">) {
  const { slug } = await params;
  const item = await getStrategy(slug);
  return <EntityReferences type="strategy" slug={slug} name={item.name} canUpdate={item.can.update} searchParams={searchParams} />;
}
