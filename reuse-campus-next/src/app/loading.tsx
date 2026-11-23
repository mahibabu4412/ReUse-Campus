export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="overflow-hidden rounded-2xl border bg-card"><div className="aspect-[4/3] animate-pulse bg-muted" /><div className="space-y-3 p-4"><div className="h-3 w-1/3 animate-pulse rounded bg-muted" /><div className="h-4 w-full animate-pulse rounded bg-muted" /><div className="h-4 w-2/3 animate-pulse rounded bg-muted" /></div></div>)}
      </div>
    </div>
  );
}
