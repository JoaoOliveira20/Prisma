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
      <PageHeader title="Editar estilo" subtitle={style.name} />
      <div className="px-5 pb-12 sm:px-10">
        <StyleForm style={style} tags={tags} />
      </div>
    </>
  );
}
