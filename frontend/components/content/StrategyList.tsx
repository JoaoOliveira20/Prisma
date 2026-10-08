import Link from "next/link";
import type { ReactNode } from "react";
import type { ContentCardData } from "@/lib/content";
import { CoverImage } from "./CoverImage";
import { FavoriteButton } from "./FavoriteButton";

type StrategyListProps = {
  items: ContentCardData[];
  emptyMessage: string;
  emptyAction?: ReactNode;
};

export function StrategyList({ items, emptyMessage, emptyAction }: StrategyListProps) {
  if (items.length === 0) {
    return (
      <div className="py-6">
        <p className="max-w-md font-serif text-2xl leading-snug text-text-muted">{emptyMessage}</p>
        {emptyAction && <div className="mt-6">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <ol className="border-t border-border">
      {items.map((item, index) => (
        <li key={item.slug} className="group relative border-b border-border">
          <Link href={item.href} className="grid items-center gap-x-8 gap-y-3 py-7 sm:grid-cols-[3rem_minmax(0,1fr)_7rem] md:grid-cols-[3rem_minmax(0,1fr)_14rem_7rem]">
            <span className="tabular hidden font-serif text-xl text-text-muted sm:block">{String(index + 1).padStart(2, "0")}</span>
            <span className="min-w-0">
              {item.meta && <span className="eyebrow block">{item.meta}</span>}
              <span className="mt-1.5 block font-serif text-3xl leading-tight transition-transform duration-300 group-hover:translate-x-1 sm:text-4xl">{item.name}</span>
              {item.summary && <span className="mt-2 block max-w-xl text-sm leading-relaxed text-text-muted">{item.summary}</span>}
              {item.tags.length > 0 && <span className="mt-3 block text-xs text-text-muted">{item.tags.map((tag) => tag.name).join(" · ")}</span>}
            </span>
            <CoverImage name={item.name} coverUrl={item.imageUrl} sizes="224px" className="hidden aspect-[4/3] w-full md:block" />
            <span aria-hidden="true" className="hidden text-right text-2xl text-text-muted transition-transform duration-300 group-hover:translate-x-1 sm:block">→</span>
          </Link>
          <FavoriteButton
            type={item.type}
            slug={item.slug}
            isFavorite={item.isFavorite}
            className="absolute right-0 top-6 opacity-0 focus-visible:opacity-100 group-hover:opacity-100 aria-pressed:opacity-100 sm:right-14 sm:top-1/2 sm:-translate-y-1/2 md:right-[8.5rem] [@media(hover:none)]:opacity-100"
          />
        </li>
      ))}
    </ol>
  );
}
