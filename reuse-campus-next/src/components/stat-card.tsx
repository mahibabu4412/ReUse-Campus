import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon, label, value, hint,
}: { icon: LucideIcon; label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
        {hint && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">{hint}</span>}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
