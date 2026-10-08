import Image from "next/image";
import Link from "next/link";
import type { Group } from "@/types/api";

export function CollectionCover({ group, href }: { group: Group; href: string }) {
  const previews = group.previews ?? [];
  const cells = previews.length === 1 ? previews : [...previews, ...Array(Math.max(0, 4 - previews.length)).fill(null)].slice(0, 4);

  return (
    <Link href={href} className="group block">
      <div className={`grid aspect-square overflow-hidden bg-surface ${previews.length === 1 ? "" : "grid-cols-2 gap-px"}`}>
        {previews.length === 0 ? (
          <span aria-hidden="true" className="@container grid place-items-center font-serif leading-none text-text/20" style={{ fontSize: "min(9rem, 40cqw)" }}>
            {group.name.charAt(0)}
          </span>
        ) : (
          cells.map((url, index) => (
            <div key={index} className="relative overflow-hidden bg-surface">
              {url && <Image src={url} alt="" fill unoptimized sizes="(min-width: 1024px) 15vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />}
            </div>
          ))
        )}
      </div>
      <div className="mt-4 space-y-1">
        {group.is_favorites && <p className="eyebrow">Coleção padrão</p>}
        <h3 className="font-serif text-3xl leading-tight">{group.name}</h3>
        <p className="tabular text-sm text-text-muted">{group.items_count} {group.items_count === 1 ? "item" : "itens"}</p>
      </div>
    </Link>
  );
}
