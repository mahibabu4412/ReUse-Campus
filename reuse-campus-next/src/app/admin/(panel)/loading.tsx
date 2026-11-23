export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl border bg-card" />)}
      </div>
      <div className="h-80 animate-pulse rounded-2xl border bg-card" />
    </div>
  );
}
