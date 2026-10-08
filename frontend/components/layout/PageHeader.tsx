import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, lede, actions }: PageHeaderProps) {
  return (
    <header className="page-x flex flex-wrap items-end justify-between gap-x-10 gap-y-6 pb-10 pt-12 sm:pt-16">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="spectrum-rule" aria-hidden="true" />
          <p className="eyebrow">{eyebrow}</p>
        </div>
        <h1 className="mt-5 font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">{title}</h1>
        {lede && <p className="mt-5 max-w-xl text-base leading-relaxed text-text-muted">{lede}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </header>
  );
}
