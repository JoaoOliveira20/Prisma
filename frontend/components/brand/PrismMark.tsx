export function PrismMark({ className = "size-7 shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="prism-left" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#5b6bd8" />
          <stop offset="1" stopColor="#c8cdf5" />
        </linearGradient>
        <linearGradient id="prism-right" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2b24a" />
          <stop offset="1" stopColor="#d6452b" />
        </linearGradient>
      </defs>
      <path d="M16 2 4 27l12-6Z" fill="url(#prism-left)" />
      <path d="M16 2l12 25-12-6Z" fill="url(#prism-right)" />
      <path d="M4 27l12-6 12 6-12 3Z" fill="#8f93a6" opacity="0.7" />
    </svg>
  );
}
