import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CollectionView } from "@/components/groups/CollectionView";
import { GroupActions } from "@/components/groups/GroupActions";
import { PageHeader } from "@/components/layout/PageHeader";
import { getGroup, getGroups } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/grupos/[id]">): Promise<Metadata> {
  const { id } = await params;
  const group = await getGroup(id);
  return { title: group.name };
}

export default async function GroupDetailPage({ params }: PageProps<"/grupos/[id]">) {
  const { id } = await params;
  const [group, groups] = await Promise.all([getGroup(id), getGroups()]);

  if (group.is_favorites) {
    redirect("/favoritos");
  }

  return (
    <>
      <PageHeader
        eyebrow={`Coleção · ${group.items_count} ${group.items_count === 1 ? "item" : "itens"}`}
        title={group.name}
        actions={
          <>
            <Link href="/grupos" className="text-sm text-text-muted underline-offset-4 hover:text-text hover:underline">← Todas as coleções</Link>
            {group.can.update && <GroupActions group={group} />}
          </>
        }
      />
      <div className="border-t border-border" />
      <CollectionView group={group} groups={groups} emptyMessage="Esta coleção ainda está vazia. Use “Salvar em grupo” nas páginas de conteúdo." />
    </>
  );
}
