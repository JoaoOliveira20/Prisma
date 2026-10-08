import Link from "next/link";
import type { ReactNode } from "react";
import { CoverImage } from "@/components/content/CoverImage";
import type { Tag } from "@/types/api";

type Fact = { label: string; value: string };

type DetailHeaderProps = {
  crumbs: { label: string; href?: string }[];
  kind: string;
  title: string;
  subtitle?: string | null;
  lede?: string | null;
  facts?: Fact[];
  tags?: Tag[];
  actions?: ReactNode;
  image: { name: string; url: string | null; aspect: string };
  layout: "wide" | "portrait" | "wide-right";
};

export function DetailHeader({ crumbs, kind, title, subtitle, lede, facts = [], tags = [], actions, image, layout }: DetailHeaderProps) {
  const portrait = layout === "portrait";
  const imageFirst = layout !== "wide-right";

  const picture = (
    <div className={portrait ? "lg:col-span-4" : "lg:col-span-7"}>
      <CoverImage name={image.name} coverUrl={image.url} sizes={portrait ? "(min-width: 1024px) 30vw, 90vw" : "(min-width: 1024px) 55vw, 90vw"} className={`${image.aspect} w-full`} />
    </div>
  );

  const text = (
    <div className={`flex flex-col justify-end ${portrait ? "lg:col-span-8" : "lg:col-span-5"} ${imageFirst ? "" : "lg:order-first"}`}>
      <div className="flex items-center gap-3">
        <span className="spectrum-rule" aria-hidden="true" />
        <p className="eyebrow">{kind}</p>
      </div>
      <h1 className="mt-5 font-serif text-5xl leading-[0.98] tracking-tight sm:text-6xl xl:text-7xl">{title}</h1>
      {subtitle && <p className="tabular mt-4 font-serif text-2xl text-text-muted">{subtitle}</p>}
      {lede && <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">{lede}</p>}
      {facts.length > 0 && (
        <dl className="mt-8 grid max-w-md grid-cols-2 gap-x-8 border-t border-border">
          {facts.map((fact) => (
            <div key={fact.label} className="border-b border-border py-3">
              <dt className="eyebrow">{fact.label}</dt>
              <dd className="mt-1 text-sm">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {tags.length > 0 && <p className="mt-5 text-sm text-text-muted">{tags.map((tag) => tag.name).join(" · ")}</p>}
      {actions && <div className="mt-8">{actions}</div>}
    </div>
  );

  return (
    <header className="page-x pb-14 pt-10">
      <nav aria-label="Trilha" className="text-sm text-text-muted">
        {crumbs.map((crumb, index) => (
          <span key={crumb.label}>
            {index > 0 && <span aria-hidden="true" className="mx-2">/</span>}
            {crumb.href ? <Link href={crumb.href} className="underline-offset-4 hover:text-text hover:underline">{crumb.label}</Link> : <span className="text-text">{crumb.label}</span>}
          </span>
        ))}
      </nav>
      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
        {imageFirst ? (
          <>
            {picture}
            {text}
          </>
        ) : (
          <>
            {text}
            {picture}
          </>
        )}
      </div>
    </header>
  );
}
