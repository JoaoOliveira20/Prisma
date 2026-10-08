import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { StyleForm } from "@/components/styles/StyleForm";
import { getTags } from "@/lib/data";

export const metadata: Metadata = { title: "Novo estilo" };

export default async function NewStylePage() {
  const tags = await getTags();

  return (
    <>
      <PageHeader title="Novo estilo" subtitle="Comece com o essencial; o restante pode ser preenchido depois." />
      <div className="px-5 pb-12 sm:px-10">
        <StyleForm tags={tags} />
      </div>
    </>
  );
}
