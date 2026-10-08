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
      <PageHeader title="Tags" subtitle="Vocabulário controlado usado para classificar estilos, pessoas e estratégias." />
      <div className="space-y-8 px-5 pb-12 sm:px-10">
        <CreateTagForm />
        <ul className="grid gap-3 lg:grid-cols-2">
          {tags.map((tag) => (
            <TagRow key={tag.slug} tag={tag} />
          ))}
        </ul>
      </div>
    </>
  );
}
