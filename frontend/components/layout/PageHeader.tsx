import type { ReactNode } from "react";
import { SearchTrigger } from "@/components/search/SearchTrigger";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 px-5 pb-6 pt-8 sm:px-10">
      <div>
        <h1 className="font-serif text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
      </div>
      <div className="flex w-full items-center gap-3 sm:w-auto">
        <SearchTrigger />
        {actions}
      </div>
    </header>
  );
}
