import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { StyleForm } from "@/components/styles/StyleForm";
import { getStyle, getTags } from "@/lib/data";

export const metadata: Metadata = { title: "Editar estilo" };

export default async function EditStylePage({ params }: PageProps<"/estilos/[slug]/editar">) {
  const { slug } = await params;
  const [style, tags] = await Promise.all([getStyle(slug), getTags()]);

  if (!style.can.update) {
    redirect(`/estilos/${slug}`);
  }

  return (
    <>
      <PageHeader eyebrow="Editar · Estilo" title={style.name} />
      <div className="pb-8">
        <StyleForm style={style} tags={tags} />
      </div>
    </>
  );
}
