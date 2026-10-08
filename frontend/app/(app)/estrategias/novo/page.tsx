import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { StrategyForm } from "@/components/strategies/StrategyForm";
import { getStyles, getTags } from "@/lib/data";

export const metadata: Metadata = { title: "Nova estratégia" };

export default async function NewStrategyPage() {
  const [tags, styles] = await Promise.all([getTags(), getStyles({ perPage: 100 })]);

  return (
    <>
      <PageHeader title="Nova estratégia" subtitle="Comece com o essencial; o restante pode ser preenchido depois." />
      <div className="px-5 pb-12 sm:px-10">
        <StrategyForm tags={tags} styles={styles} />
      </div>
    </>
  );
}
