import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { StrategyForm } from "@/components/strategies/StrategyForm";
import { getStrategy, getStyles, getTags } from "@/lib/data";

export const metadata: Metadata = { title: "Editar estratégia" };

export default async function EditStrategyPage({ params }: PageProps<"/estrategias/[slug]/editar">) {
  const { slug } = await params;
  const [strategy, tags, styles] = await Promise.all([getStrategy(slug), getTags(), getStyles({ perPage: 100 })]);

  if (!strategy.can.update) {
    redirect(`/estrategias/${slug}`);
  }

  return (
    <>
      <PageHeader eyebrow="Editar · Estratégia" title={strategy.name} />
      <div className="pb-8">
        <StrategyForm strategy={strategy} tags={tags} styles={styles} />
      </div>
    </>
  );
}
