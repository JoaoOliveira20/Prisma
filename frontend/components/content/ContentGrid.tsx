import type { ReactNode } from "react";
import type { ContentCardData } from "@/lib/content";
import { ImageTile } from "./ImageTile";

export type GridLayout = "rhythm" | "portraits" | "portraits-compact" | "even";

type ContentGridProps = {
  items: ContentCardData[];
  layout?: GridLayout;
  headingLevel?: 2 | 3;
  emptyMessage: string;
  emptyAction?: ReactNode;
};

const rhythm = [
  { cell: "lg:col-span-7", aspect: "aspect-[4/3] lg:aspect-[3/2]" },
  { cell: "lg:col-span-5 lg:mt-24", aspect: "aspect-[4/3] lg:aspect-[4/5]" },
  { cell: "lg:col-span-4", aspect: "aspect-[4/3] lg:aspect-square" },
  { cell: "lg:col-span-4 lg:mt-12", aspect: "aspect-[4/3] lg:aspect-[4/5]" },
  { cell: "lg:col-span-4", aspect: "aspect-[4/3] lg:aspect-square" },
];

const portraitOffsets = ["", "xl:mt-12", "", "xl:mt-12"];

export function ContentGrid({ items, layout = "even", headingLevel = 3, emptyMessage, emptyAction }: ContentGridProps) {
  if (items.length === 0) {
    return (
      <div className="py-6">
        <p className="max-w-md font-serif text-2xl leading-snug text-text-muted">{emptyMessage}</p>
        {emptyAction && <div className="mt-6">{emptyAction}</div>}
      </div>
    );
  }

  if (layout === "rhythm") {
    return (
      <ul className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-12">
        {items.map((item, index) => {
          const slot = rhythm[index % rhythm.length];
          return (
            <li key={`${item.type}-${item.slug}`} className={slot.cell}>
              <ImageTile item={item} aspect={slot.aspect} headingLevel={headingLevel} />
            </li>
          );
        })}
      </ul>
    );
  }

  if (layout === "portraits" || layout === "portraits-compact") {
    const columns = layout === "portraits" ? "xl:grid-cols-4" : "xl:grid-cols-3";
    const offsets = layout === "portraits" ? portraitOffsets : [""];

    return (
      <ul className={`grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 ${columns}`}>
        {items.map((item, index) => (
          <li key={`${item.type}-${item.slug}`} className={offsets[index % offsets.length]}>
            <ImageTile item={item} aspect="aspect-[4/5]" sizes="(min-width: 1280px) 22vw, 45vw" headingLevel={headingLevel} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={`${item.type}-${item.slug}`}>
          <ImageTile item={item} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
