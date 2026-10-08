import type { Tag } from "@/types/api";

export function TagList({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag.slug} className="rounded-full bg-background px-2.5 py-0.5 text-[11px] text-text-muted">
          {tag.name}
        </li>
      ))}
    </ul>
  );
}
