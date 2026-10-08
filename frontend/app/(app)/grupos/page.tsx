import type { Metadata } from "next";
import { CollectionCover } from "@/components/groups/CollectionCover";
import { CreateGroupButton } from "@/components/groups/CreateGroupButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { getGroups } from "@/lib/data";

export const metadata: Metadata = { title: "Grupos" };

export default async function GroupsPage() {
  const groups = await getGroups();

  return (
    <>
      <PageHeader
        eyebrow="Coleções"
        title="Grupos"
        lede="Seus conjuntos pessoais de estilos, pessoas, ideias e imagens. Os favoritos moram na primeira coleção."
        actions={<CreateGroupButton />}
      />
      <div className="page-x border-t border-border pt-12">
        <ul className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {groups.map((group) => (
            <li key={group.id}>
              <CollectionCover group={group} href={group.is_favorites ? "/favoritos" : `/grupos/${group.id}`} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
