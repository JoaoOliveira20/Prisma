import type { ReactNode } from "react";

export function FormLayout({ aside, children }: { aside: ReactNode; children: ReactNode }) {
  return (
    <div className="page-x grid gap-12 border-t border-border pt-12 lg:grid-cols-12 lg:gap-16">
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-10">{aside}</div>
      </aside>
      <div className="space-y-14 lg:col-span-8">{children}</div>
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="border-b border-border pb-3 font-serif text-2xl">{title}</h2>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}
