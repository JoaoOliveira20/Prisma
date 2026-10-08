import Link from "next/link";
import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  count?: number;
  seeAllHref?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function Section({ id, title, count, seeAllHref, action, children }: SectionProps) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24">
      <div className="flex items-baseline justify-between gap-6 border-t border-border pb-6 pt-4">
        <h2 id={id} className="font-serif text-2xl">
          {title}
          {count !== undefined && <span className="tabular ml-2 text-sm text-text-muted">{count}</span>}
        </h2>
        {action ?? (seeAllHref && <Link href={seeAllHref} className="whitespace-nowrap text-sm text-text-muted underline-offset-4 hover:text-text hover:underline">Ver todos →</Link>)}
      </div>
      {children}
    </section>
  );
}
