export function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="grid gap-x-12 sm:grid-cols-2">
      {items.map((item, index) => (
        <li key={item} className="flex items-baseline gap-5 border-t border-border py-5">
          <span className="tabular font-serif text-lg text-text-muted">{String(index + 1).padStart(2, "0")}</span>
          <span className="font-serif text-2xl leading-snug">{item}</span>
        </li>
      ))}
    </ol>
  );
}
