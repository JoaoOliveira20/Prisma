import Link from "next/link";
import type { ContentCardData } from "@/lib/content";
import { CoverImage } from "./CoverImage";
import { FavoriteButton } from "./FavoriteButton";

type ImageTileProps = {
  item: ContentCardData;
  aspect?: string;
  eyebrow?: string;
  sizes?: string;
  headingLevel?: 2 | 3;
};

export function ImageTile({ item, aspect = "aspect-[4/3]", eyebrow, sizes = "(min-width: 1024px) 30vw, 90vw", headingLevel = 3 }: ImageTileProps) {
  const label = eyebrow ?? item.meta;
  const Heading = `h${headingLevel}` as const;

  return (
    <figure className="group relative">
      <Link href={item.href} className="block">
        <CoverImage name={item.name} coverUrl={item.imageUrl} sizes={sizes} className={`${aspect} w-full [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-[1.03]`} />
        <figcaption className="mt-4 space-y-1.5">
          {label && <p className="eyebrow">{label}</p>}
          <Heading className="font-serif text-2xl leading-tight">{item.name}</Heading>
          {item.summary && <p className="line-clamp-2 max-w-md text-sm leading-relaxed text-text-muted">{item.summary}</p>}
          {item.tags.length > 0 && <p className="pt-1 text-xs text-text-muted">{item.tags.map((tag) => tag.name).join(" · ")}</p>}
        </figcaption>
      </Link>
      <FavoriteButton
        type={item.type}
        slug={item.slug}
        isFavorite={item.isFavorite}
        className="absolute right-3 top-3 opacity-0 focus-visible:opacity-100 group-hover:opacity-100 aria-pressed:opacity-100 [@media(hover:none)]:opacity-100"
      />
    </figure>
  );
}
