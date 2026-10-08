import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { StyleForm } from "@/components/styles/StyleForm";
import { getTags } from "@/lib/data";

export const metadata: Metadata = { title: "Novo estilo" };

export default async function NewStylePage() {
  const tags = await getTags();

  return (
    <>
      <PageHeader eyebrow="Novo registro · Estilo" title="Novo estilo" lede="Comece com o essencial. O restante pode ser escrito depois." />
      <div className="pb-8">
        <StyleForm tags={tags} />
      </div>
    </>
  );
}
