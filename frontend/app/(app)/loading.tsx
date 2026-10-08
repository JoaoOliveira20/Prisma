export default function Loading() {
  return (
    <div className="page-x pt-16" role="status" aria-label="Carregando">
      <div className="h-3 w-40 animate-pulse bg-border" />
      <div className="mt-6 h-14 w-72 animate-pulse bg-border" />
      <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
        <div className="aspect-[3/2] animate-pulse bg-border lg:col-span-7" />
        <div className="aspect-[4/5] animate-pulse bg-border lg:col-span-5 lg:mt-24" />
      </div>
    </div>
  );
}
