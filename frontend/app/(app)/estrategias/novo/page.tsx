import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { StrategyForm } from "@/components/strategies/StrategyForm";
import { getStyles, getTags } from "@/lib/data";

export const metadata: Metadata = { title: "Nova estratégia" };

export default async function NewStrategyPage() {
  const [tags, styles] = await Promise.all([getTags(), getStyles({ perPage: 100 })]);

  return (
    <>
      <PageHeader eyebrow="Novo registro · Estratégia" title="Nova estratégia" lede="Comece com o essencial. O restante pode ser escrito depois." />
      <div className="pb-8">
        <StrategyForm tags={tags} styles={styles} />
      </div>
    </>
  );
}
