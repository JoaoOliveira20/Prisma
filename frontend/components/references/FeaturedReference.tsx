import Link from "next/link";
import { FadeImage } from "@/components/content/FadeImage";
import { contentPaths, formatDate } from "@/lib/content";
import type { GalleryItem } from "@/types/api";

export function FeaturedReference({ item }: { item: GalleryItem }) {
  const href = `/referencias/${item.id}`;
  const links = item.links ?? [];

  return (
    <section aria-label="Última adição" className="mb-16 lg:grid lg:grid-cols-12 lg:gap-12">
      <Link href={href} aria-label={`Abrir ${item.title}`} className="group block overflow-hidden bg-surface lg:col-span-8">
        <FadeImage
          src={item.image_url}
          alt={item.title}
          width={1600}
          height={1200}
          unoptimized
          priority
          className="mx-auto h-auto max-h-[60vh] w-full object-contain transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.015]"
        />
      </Link>
      <div className="mt-6 flex flex-col justify-end lg:col-span-4 lg:mt-0">
        <p className="eyebrow">
          Última adição{item.created_at && <span className="tabular"> · {formatDate(item.created_at)}</span>}
        </p>
        <h2 className="mt-3 font-serif text-4xl leading-tight">
          <Link href={href} className="underline-offset-4 hover:underline">{item.title}</Link>
        </h2>
        {item.description && <p className="mt-4 line-clamp-4 max-w-md leading-relaxed text-text-muted">{item.description}</p>}
        {links.length > 0 && (
          <p className="mt-5 text-sm text-text-muted">
            Faz parte de{" "}
            {links.slice(0, 4).map((link, index) => (
              <span key={`${link.type}-${link.slug}`}>
                {index > 0 && ", "}
                <Link href={`${contentPaths[link.type]}/${link.slug}`} className="text-text underline-offset-4 hover:underline">{link.name}</Link>
              </span>
            ))}
          </p>
        )}
        <Link href={href} className="group mt-6 inline-flex items-baseline gap-2 font-serif text-xl">
          <span className="nav-link">Abrir referência</span>
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </Link>
      </div>
    </section>
  );
}
