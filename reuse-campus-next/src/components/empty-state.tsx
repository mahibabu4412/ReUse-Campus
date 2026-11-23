import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title = "Nothing here yet",
  description = "",
  actionLabel,
  actionHref,
}: { title?: string; description?: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
      <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><PackageOpen className="size-7" /></span>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {actionLabel && actionHref && <Button asChild className="mt-5" size="sm"><Link href={actionHref}>{actionLabel}</Link></Button>}
    </div>
  );
}
