import type { ComponentProps } from "react";

type FieldProps = {
  label: string;
  error?: string;
  tone?: "light" | "night";
};

const tones = {
  light: "border-border bg-surface-raised text-text placeholder:text-text-muted",
  night: "border-night-border bg-night-surface text-night-text placeholder:text-night-muted",
};

const labelTones = { light: "text-text-muted", night: "text-night-muted" };
const errorTones = { light: "text-danger", night: "text-night-danger" };

export function TextField({ label, error, tone = "light", ...props }: FieldProps & ComponentProps<"input">) {
  return (
    <label className="block space-y-1.5">
      <span className={`text-xs font-medium ${labelTones[tone]}`}>{label}</span>
      <input
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-md border px-3 py-2 text-sm ${tones[tone]}`}
        {...props}
      />
      {error && <span className={`block text-xs ${errorTones[tone]}`} role="alert">{error}</span>}
    </label>
  );
}

export function TextAreaField({ label, error, rows = 4, ...props }: Omit<FieldProps, "tone"> & ComponentProps<"textarea">) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <textarea
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-md border px-3 py-2 text-sm ${tones.light}`}
        {...props}
      />
      {error && <span className="block text-xs text-danger" role="alert">{error}</span>}
    </label>
  );
}
