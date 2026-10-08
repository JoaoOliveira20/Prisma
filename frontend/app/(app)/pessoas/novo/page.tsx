import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PersonForm } from "@/components/people/PersonForm";
import { getStyles, getTags } from "@/lib/data";

export const metadata: Metadata = { title: "Nova pessoa" };

export default async function NewPersonPage() {
  const [tags, styles] = await Promise.all([getTags(), getStyles({ perPage: 100 })]);

  return (
    <>
      <PageHeader title="Nova pessoa" subtitle="Comece com o essencial; o restante pode ser preenchido depois." />
      <div className="px-5 pb-12 sm:px-10">
        <PersonForm tags={tags} styles={styles} />
      </div>
    </>
  );
}
