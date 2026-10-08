import { PrismMark } from "./PrismMark";

type LogoProps = {
  showWordmark?: boolean;
  large?: boolean;
};

export function Logo({ showWordmark = true, large = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center ${large ? "gap-4" : "gap-3"}`}>
      <PrismMark className={large ? "size-10 shrink-0" : "size-7 shrink-0"} />
      {showWordmark && (
        <span className={`font-medium ${large ? "text-base tracking-[0.4em]" : "text-xs tracking-[0.35em]"}`}>PRISMA</span>
      )}
    </span>
  );
}
