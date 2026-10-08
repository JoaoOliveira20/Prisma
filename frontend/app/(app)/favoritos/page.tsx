import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionView } from "@/components/groups/CollectionView";
import { PageHeader } from "@/components/layout/PageHeader";
import { getGroup, getGroups } from "@/lib/data";

export const metadata: Metadata = { title: "Favoritos" };

export default async function FavoritesPage() {
  const groups = await getGroups();
  const favorites = groups.find((group) => group.is_favorites);

  if (!favorites) {
    notFound();
  }

  const group = await getGroup(String(favorites.id));

  return (
    <>
      <PageHeader
        eyebrow={`Coleção pessoal · ${group.items_count} ${group.items_count === 1 ? "item" : "itens"}`}
        title="Favoritos"
        lede="O que você quis guardar por perto. Use o coração em qualquer estilo, pessoa, estratégia ou imagem."
      />
      <div className="border-t border-border" />
      <CollectionView group={group} groups={groups} emptyMessage="Ainda nada por aqui. Toque no coração de qualquer conteúdo para guardá-lo nesta coleção." />
    </>
  );
}
