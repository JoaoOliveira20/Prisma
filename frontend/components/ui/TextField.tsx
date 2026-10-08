import { useId, type ComponentProps, type ReactNode } from "react";

type FieldProps = {
  label: string;
  error?: string;
  tone?: "light" | "night";
};

const tones = {
  light: "rounded-sm border-border-strong bg-surface-raised px-3.5 py-2.5 text-text placeholder:text-text-muted",
  night:
    "h-12 rounded-sm border-night-muted/60 bg-night-surface px-4 text-night-text transition-colors placeholder:text-night-muted hover:border-night-muted focus:border-night-text",
};

const labelTones = {
  light: "text-sm font-medium text-text",
  night: "text-sm font-medium text-night-text/85",
};
const errorTones = { light: "text-danger", night: "text-night-danger" };

export function TextField({ label, error, tone = "light", trailing, id, ...props }: FieldProps & { trailing?: ReactNode } & ComponentProps<"input">) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className={`block ${labelTones[tone]}`}>{label}</label>
      <div className="relative">
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`w-full border text-sm ${tones[tone]} ${trailing ? "pr-24" : ""}`}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>}
      </div>
      {error && <span id={errorId} className={`block text-xs ${errorTones[tone]}`} role="alert">{error}</span>}
    </div>
  );
}

export function TextAreaField({ label, error, rows = 4, ...props }: Omit<FieldProps, "tone"> & ComponentProps<"textarea">) {
  return (
    <label className="block space-y-1.5">
      <span className={labelTones.light}>{label}</span>
      <textarea
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={`w-full border text-sm ${tones.light}`}
        {...props}
      />
      {error && <span className="block text-xs text-danger" role="alert">{error}</span>}
    </label>
  );
}
