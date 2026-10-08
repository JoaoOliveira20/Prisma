import Link from "next/link";
import type { ContentCardData } from "@/lib/content";
import { FavoriteButton } from "./FavoriteButton";
import { CoverImage } from "./CoverImage";
import { TagList } from "./TagList";

export function ContentCard({ item }: { item: ContentCardData }) {
  const aspect = item.type === "person" ? "aspect-[4/5]" : "aspect-[4/3]";

  return (
    <article className="group relative flex flex-col gap-3">
      <Link href={item.href} className="block space-y-3 rounded-md">
        <CoverImage
          name={item.name}
          coverUrl={item.imageUrl}
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
          className={`${aspect} w-full rounded-md transition-transform duration-300 group-hover:scale-[1.01]`}
        />
        <div>
          <h3 className="font-serif text-lg leading-tight">{item.name}</h3>
          {item.meta && <p className="mt-0.5 text-xs text-text-muted">{item.meta}</p>}
          {item.summary && <p className="mt-1.5 line-clamp-2 text-sm text-text-muted">{item.summary}</p>}
        </div>
      </Link>
      <TagList tags={item.tags} />
      <FavoriteButton type={item.type} slug={item.slug} isFavorite={item.isFavorite} className="absolute right-2 top-2" />
    </article>
  );
}
