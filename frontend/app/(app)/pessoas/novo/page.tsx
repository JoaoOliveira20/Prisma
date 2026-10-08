import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PersonForm } from "@/components/people/PersonForm";
import { getStyles, getTags } from "@/lib/data";

export const metadata: Metadata = { title: "Nova pessoa" };

export default async function NewPersonPage() {
  const [tags, styles] = await Promise.all([getTags(), getStyles({ perPage: 100 })]);

  return (
    <>
      <PageHeader eyebrow="Novo registro · Pessoa" title="Nova pessoa" lede="Comece com o essencial. O restante pode ser escrito depois." />
      <div className="pb-8">
        <PersonForm tags={tags} styles={styles} />
      </div>
    </>
  );
}
