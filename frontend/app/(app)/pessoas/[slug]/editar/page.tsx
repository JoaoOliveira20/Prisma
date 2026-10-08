import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { PersonForm } from "@/components/people/PersonForm";
import { getPerson, getStyles, getTags } from "@/lib/data";

export const metadata: Metadata = { title: "Editar pessoa" };

export default async function EditPersonPage({ params }: PageProps<"/pessoas/[slug]/editar">) {
  const { slug } = await params;
  const [person, tags, styles] = await Promise.all([getPerson(slug), getTags(), getStyles({ perPage: 100 })]);

  if (!person.can.update) {
    redirect(`/pessoas/${slug}`);
  }

  return (
    <>
      <PageHeader eyebrow="Editar · Pessoa" title={person.name} />
      <div className="pb-8">
        <PersonForm person={person} tags={tags} styles={styles} />
      </div>
    </>
  );
}
