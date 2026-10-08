import Link from "next/link";
import type { ReactNode } from "react";

type DimensionSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  count?: number;
  action?: ReactNode;
  seeAll?: { href: string; label: string };
  children: ReactNode;
};

export function DimensionSection({ id, eyebrow, title, count, action, seeAll, children }: DimensionSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="page-x scroll-mt-28 border-t border-border py-14 lg:grid lg:grid-cols-12 lg:gap-12">
      <header className="reveal mb-8 lg:col-span-3 lg:mb-0">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`} className="mt-2 font-serif text-3xl leading-tight">
          {title}
          {count !== undefined && <span className="tabular ml-3 align-middle text-sm text-text-muted">{count}</span>}
        </h2>
        {action && <div className="mt-5">{action}</div>}
      </header>
      <div className="reveal min-w-0 lg:col-span-9">
        {children}
        {seeAll && (
          <div className="mt-12 border-t border-border pt-5">
            <Link href={seeAll.href} className="group inline-flex items-baseline gap-3 font-serif text-2xl">
              <span className="nav-link">{seeAll.label}</span>
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
