import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "danger" | "night";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/85",
  secondary: "border border-border bg-surface-raised text-text hover:bg-surface",
  danger: "border border-danger/40 bg-surface-raised text-danger hover:bg-danger/10",
  night: "bg-night-text text-night hover:bg-night-text/85",
};

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({ variant = "primary", className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
