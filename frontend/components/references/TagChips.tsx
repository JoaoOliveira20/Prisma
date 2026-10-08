import Link from "next/link";
import type { ReferenceItem } from "@/types/api";

type TagChipsProps = {
  tags?: ReferenceItem["tags"];
  tone?: "paper" | "night";
};

export function TagChips({ tags = [], tone = "paper" }: TagChipsProps) {
  if (tags.length === 0) return null;

  const chip = tone === "night" ? "border-night-border text-night-muted hover:bg-night-surface hover:text-night-text" : "border-border text-text-muted hover:border-border-strong hover:text-text";

  return (
    <ul aria-label="Tags principais" className="flex flex-wrap gap-1.5 pt-1">
      {tags.map((tag) => (
        <li key={tag.slug}>
          <Link href={`/referencias?tag=${tag.slug}`} className={`block border px-2 py-0.5 text-[11px] leading-snug transition-colors duration-200 ${chip}`}>
            {tag.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
