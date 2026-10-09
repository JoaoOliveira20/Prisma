"use client";

import { NavIcon } from "@/components/layout/NavIcon";

type SearchFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  className?: string;
};

export const controlClass =
  "h-11 rounded-sm border border-border-strong bg-surface-raised px-3 text-sm transition-colors duration-200 hover:border-text focus:border-text";

export function SearchField({ id, label, placeholder, value, onChange, onSubmit, onClear, className = "" }: SearchFieldProps) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
        <NavIcon name="search" />
      </span>
      <label className="sr-only" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit();
          }
          if (event.key === "Escape" && value) {
            event.preventDefault();
            onClear();
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        className="h-11 w-full rounded-sm border border-border-strong bg-surface-raised pl-10 pr-11 font-serif text-lg transition-colors duration-200 placeholder:text-text-muted hover:border-text focus:border-text [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpar busca"
          className="results-in absolute right-0 top-0 grid size-11 place-items-center text-text-muted transition-colors duration-200 hover:text-text"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}
