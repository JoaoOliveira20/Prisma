import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateTagForm } from "@/components/tags/CreateTagForm";
import { TagRow } from "@/components/tags/TagRow";
import { getTags } from "@/lib/data";

export const metadata: Metadata = { title: "Tags" };

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <>
      <PageHeader eyebrow="Vocabulário" title="Tags" lede="O vocabulário controlado do arquivo. Cada tag classifica estilos, pessoas e estratégias, e nasce aqui, de propósito." />
      <div className="page-x border-y border-border py-6">
        <CreateTagForm />
      </div>
      <div className="page-x pt-4">
        <ul className="lg:grid lg:grid-cols-2 lg:gap-x-16">
          {tags.map((tag) => (
            <TagRow key={tag.slug} tag={tag} />
          ))}
        </ul>
      </div>
    </>
  );
}
