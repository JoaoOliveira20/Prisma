export function NumberedList({ items }: { items: string[] }) {
  return (
    <ol>
      {items.map((item, index) => (
        <li key={item} className="flex items-baseline gap-5 border-t border-border py-4">
          <span className="tabular shrink-0 font-serif text-lg text-text-muted">{String(index + 1).padStart(2, "0")}</span>
          <span className="min-w-0 font-serif text-2xl leading-snug">{item}</span>
        </li>
      ))}
    </ol>
  );
}
