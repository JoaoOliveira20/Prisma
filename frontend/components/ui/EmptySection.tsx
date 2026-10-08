export function EmptySection({ message }: { message: string }) {
  return <p className="rounded-md border border-dashed border-border px-6 py-10 text-center text-sm text-text-muted">{message}</p>;
}
