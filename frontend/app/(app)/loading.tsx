export default function Loading() {
  return (
    <div className="px-5 py-10 sm:px-10" role="status" aria-label="Carregando">
      <div className="h-8 w-48 animate-pulse rounded bg-border" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="aspect-[4/3] animate-pulse rounded-md bg-border" />
        ))}
      </div>
    </div>
  );
}
