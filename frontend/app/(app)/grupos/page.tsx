import type { Metadata } from "next";
import Link from "next/link";
import { CreateGroupForm } from "@/components/groups/CreateGroupForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { getGroups } from "@/lib/data";

export const metadata: Metadata = { title: "Grupos" };

export default async function GroupsPage() {
  const groups = await getGroups();

  return (
    <>
      <PageHeader title="Grupos" subtitle="Suas coleções pessoais. Os favoritos ficam no grupo Favoritos." />
      <div className="space-y-8 px-5 pb-12 sm:px-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <li key={group.id}>
              <Link href={`/grupos/${group.id}`} className="block rounded-lg border border-border bg-surface-raised p-5 transition-colors hover:bg-surface">
                <h2 className="font-serif text-xl">{group.name}</h2>
                <p className="mt-1 text-xs text-text-muted">
                  {group.items_count} {group.items_count === 1 ? "item" : "itens"}
                  {group.is_favorites && " · grupo padrão"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <CreateGroupForm />
      </div>
    </>
  );
}
