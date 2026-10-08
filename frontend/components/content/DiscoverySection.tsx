import Link from "next/link";
import type { ReactNode } from "react";

type DiscoverySectionProps = {
  id: string;
  title: string;
  total: number;
  shown: number;
  seeAllHref: string;
  children: ReactNode;
};

export function DiscoverySection({ id, title, total, shown, seeAllHref, children }: DiscoverySectionProps) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 id={id} className="font-serif text-xl">
          {title} <span className="text-sm text-text-muted">({total})</span>
        </h2>
        {total > shown && <Link href={seeAllHref} className="text-xs text-text-muted hover:text-text">Ver todos →</Link>}
      </div>
      {children}
    </section>
  );
}
