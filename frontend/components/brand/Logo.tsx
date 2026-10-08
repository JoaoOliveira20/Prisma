import { PrismMark } from "./PrismMark";

export function Logo({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <PrismMark />
      {showWordmark && (
        <span className="text-xs font-medium tracking-[0.35em]">PRISMA</span>
      )}
    </span>
  );
}
