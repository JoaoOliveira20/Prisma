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
      <PageHeader eyebrow="Vocabulário" title="Tags" lede="O seu vocabulário controlado. Cada tag classifica estilos, pessoas, estratégias e imagens, e nasce aqui, de propósito." />
      <div className="page-x border-y border-border py-6">
        <CreateTagForm />
      </div>
      <div className="page-x pt-4">
        {tags.length === 0 && <p className="max-w-lg py-8 font-serif text-2xl leading-snug text-text-muted">Você ainda não criou nenhuma tag. Crie a primeira acima e use-a para classificar o que você anota.</p>}
        <ul className="lg:grid lg:grid-cols-2 lg:gap-x-16">
          {tags.map((tag) => (
            <TagRow key={tag.slug} tag={tag} />
          ))}
        </ul>
      </div>
    </>
  );
}
