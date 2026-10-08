import type { ReactNode } from "react";

type DimensionSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
};

export function DimensionSection({ id, eyebrow, title, count, action, children }: DimensionSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="page-x scroll-mt-28 border-t border-border py-14 lg:grid lg:grid-cols-12 lg:gap-12">
      <header className="mb-8 lg:col-span-3 lg:mb-0">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`} className="mt-2 font-serif text-3xl leading-tight">
          {title}
          {count !== undefined && <span className="tabular ml-3 align-middle text-sm text-text-muted">{count}</span>}
        </h2>
        {action && <div className="mt-5">{action}</div>}
      </header>
      <div className="min-w-0 lg:col-span-9">{children}</div>
    </section>
  );
}
