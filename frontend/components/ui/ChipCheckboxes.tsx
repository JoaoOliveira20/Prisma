import type { ReactNode } from "react";

type Option = { value: string; label: string };

type ChipCheckboxesProps = {
  legend: string;
  name: string;
  options: Option[];
  selected?: string[];
  error?: string;
  emptyMessage?: string;
  hint?: ReactNode;
};

export function ChipCheckboxes({ legend, name, options, selected = [], error, emptyMessage, hint }: ChipCheckboxesProps) {
  const selectedValues = new Set(selected);

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-medium text-text-muted">{legend}</legend>
      {options.length === 0 && emptyMessage && <p className="text-xs text-text-muted">{emptyMessage}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input type="checkbox" name={name} value={option.value} defaultChecked={selectedValues.has(option.value)} className="peer sr-only" />
            <span className="inline-block rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-text-muted peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {hint && <div className="text-xs text-text-muted">{hint}</div>}
      {error && <p className="text-xs text-danger" role="alert">{error}</p>}
    </fieldset>
  );
}
