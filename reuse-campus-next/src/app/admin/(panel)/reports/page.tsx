import Link from "next/link";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { reviewReport } from "@/actions/admin";
import { prisma } from "@/lib/prisma";
import { statusTone, timeAgo, STATUS_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Report management" };

const STATUSES = ["pending", "reviewed", "resolved", "dismissed", "all"] as const;

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: raw } = await searchParams;
  const status = (STATUSES as readonly string[]).includes(raw ?? "") ? raw! : "pending";
  const rows = await prisma.reports.findMany({
    where: status === "all" ? {} : { status: status as "pending" },
    orderBy: { created_at: "desc" },
    include: {
      users_reports_reporter_idTousers: { select: { full_name: true } },
      listings: { select: { title: true } },
      users_reports_reported_user_idTousers: { select: { full_name: true } },
    },
  });
  const counts = await prisma.reports.groupBy({ by: ["status"], _count: true });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4"><h1 className="text-lg font-semibold">User reports <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{countMap.pending ?? 0} pending</span></h1><p className="text-xs text-muted-foreground">Review and resolve reports submitted by students.</p></div>
      <div className="flex gap-1 overflow-x-auto border-b px-4">
        {STATUSES.map((s) => <Link key={s} href={`/admin/reports?status=${s}`} className={cn("border-b-2 px-4 py-3 text-sm font-medium capitalize", status === s ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{s}{s !== "all" && countMap[s] ? <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{countMap[s]}</span> : null}</Link>)}
      </div>
      <div className="space-y-3 p-5">
        {rows.length ? rows.map((r) => (
          <div key={r.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center gap-2"><Flag className="size-4 text-primary" /><h2 className="font-semibold capitalize">{r.reason}</h2><Badge className={statusTone(r.status)}>{STATUS_LABELS[r.status]}</Badge><span className="ml-auto text-xs text-muted-foreground">{timeAgo(r.created_at)}</span></div>
            <p className="mt-2 text-xs text-muted-foreground">Reported by <b>{r.users_reports_reporter_idTousers.full_name}</b> · Listing: {r.listings ? <Link href={`/listing/${r.listing_id}`} className="text-primary hover:underline">{r.listings.title}</Link> : <i>removed</i>} · User: {r.users_reports_reported_user_idTousers?.full_name || "—"}</p>
            {r.details && <p className="mt-2 rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">“{r.details}”</p>}
            {r.admin_note && <p className="mt-2 text-xs text-primary">Admin note: {r.admin_note}</p>}
            {r.status === "pending" && (
              <form action={reviewReport} className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                <input type="hidden" name="id" value={r.id} />
                <input name="admin_note" placeholder="Admin note (optional)" className="min-w-40 flex-1 rounded-lg border bg-background px-3 py-2 text-xs" />
                <Button type="submit" name="action" value="resolve_report" size="sm">Resolve</Button>
                <Button type="submit" name="action" value="review_report" size="sm" variant="outline">Mark reviewed</Button>
                <Button type="submit" name="action" value="dismiss_report" size="sm" variant="ghost">Dismiss</Button>
              </form>
            )}
          </div>
        )) : <EmptyState title="No reports here" description="Reports from students will appear in this queue." />}
      </div>
    </div>
  );
}
