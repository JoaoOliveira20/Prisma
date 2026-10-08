import type { ReactNode } from "react";
import type { ContentCardData } from "@/lib/content";
import { ContentCard } from "./ContentCard";

type ContentGridProps = {
  items: ContentCardData[];
  emptyMessage: string;
  emptyAction?: ReactNode;
};

export function ContentGrid({ items, emptyMessage, emptyAction }: ContentGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-6 py-14 text-center">
        <p className="text-sm text-text-muted">{emptyMessage}</p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {items.map((item) => (
        <li key={`${item.type}-${item.slug}`}>
          <ContentCard item={item} />
        </li>
      ))}
    </ul>
  );
}
