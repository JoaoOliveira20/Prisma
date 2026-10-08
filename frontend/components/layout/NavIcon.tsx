import type { IconName } from "@/lib/navigation";

const paths: Record<IconName, string> = {
  plus: "M12 5v14M5 12h14",
  heart: "M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  compass: "M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5z",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5",
  users: "M16 20v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M10 11a4 4 0 100-8 4 4 0 000 8zM20 20v-1a4 4 0 00-3-3.9",
  book: "M5 4h10a4 4 0 014 4v12H9a4 4 0 01-4-4V4zM5 16a4 4 0 014-4h10",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5h.01",
  tag: "M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01",
  folder: "M3 6h6l2 2h10v11H3z",
};

export function NavIcon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
