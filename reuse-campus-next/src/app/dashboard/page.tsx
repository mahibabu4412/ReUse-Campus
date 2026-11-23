import Link from "next/link";
import { Bell, Heart, LayoutDashboard, Package, Plus, Repeat2, Search, Send, Handshake, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusTone, timeAgo, STATUS_LABELS } from "@/lib/format";

export const metadata = { title: "Dashboard overview" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const student = await requireStudent();
  await searchParams;
  const uid = student.id;
  const [myListings, outPending, inPending, completed, saved, recent, notifs, monthly] = await Promise.all([
    prisma.listings.count({ where: { user_id: uid, status: "active" } }),
    prisma.item_requests.count({ where: { requester_id: uid, status: "pending" } }),
    prisma.item_requests.count({ where: { owner_id: uid, status: "pending" } }),
    prisma.exchange_history.count({ where: { OR: [{ requester_id: uid }, { owner_id: uid }] } }),
    prisma.favorites.count({ where: { user_id: uid } }),
    prisma.item_requests.findMany({
      where: { OR: [{ requester_id: uid }, { owner_id: uid }] },
      orderBy: { updated_at: "desc" }, take: 6,
      include: { listings: { select: { title: true } }, users_item_requests_owner_idTousers: { select: { full_name: true } }, users_item_requests_requester_idTousers: { select: { full_name: true } } },
    }),
    prisma.notifications.findMany({ where: { user_id: uid }, orderBy: { created_at: "desc" }, take: 5 }),
    prisma.listings.groupBy({
      by: ["created_at"], where: { user_id: uid }, _count: true,
    }).catch(() => [] as { created_at: Date; _count: number }[]),
  ]);

  // 6-month activity buckets
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("en", { month: "short" }), count: 0 };
  });
  const allListings = await prisma.listings.findMany({
    where: { user_id: uid, created_at: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } },
    select: { created_at: true },
  });
  allListings.forEach((l) => {
    const key = `${l.created_at.getFullYear()}-${String(l.created_at.getMonth() + 1).padStart(2, "0")}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.count++;
  });
  const max = Math.max(1, ...months.map((m) => m.count));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Active listings" value={myListings} />
        <StatCard icon={Send} label="My requests" value={outPending} hint={`${outPending} pending`} />
        <StatCard icon={Handshake} label="Incoming requests" value={inPending} hint={`${inPending} new`} />
        <StatCard icon={Repeat2} label="Completed exchanges" value={completed} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4"><h2 className="font-semibold">Recent activity</h2><Button asChild variant="ghost" size="sm"><Link href="/dashboard/requests">View all</Link></Button></div>
            {recent.length ? (
              <div className="divide-y">
                {recent.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-sm">
                    <span className="font-medium">{r.listings.title}</span>
                    <span className="text-muted-foreground">with {r.owner_id === uid ? r.users_item_requests_requester_idTousers.full_name : r.users_item_requests_owner_idTousers.full_name}</span>
                    <Badge className={`ml-auto ${statusTone(r.status)}`}>{STATUS_LABELS[r.status]}</Badge>
                    <span className="text-xs text-muted-foreground">{timeAgo(r.updated_at)}</span>
                  </div>
                ))}
              </div>
            ) : <div className="p-5"><EmptyState title="No activity yet" description="Browse the marketplace and send your first request." actionLabel="Explore items" actionHref="/explore" /></div>}
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-semibold">Your listing activity</h2><span className="text-xs text-muted-foreground">Last 6 months</span></div>
            <div className="flex h-40 items-end justify-between gap-3">
              {months.map((m) => (
                <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full max-w-10 rounded-t-lg bg-primary transition-all" style={{ height: `${Math.max(6, (m.count / max) * 120)}px` }} title={`${m.count} listings`} />
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4"><h2 className="font-semibold">Notifications</h2><Button asChild variant="ghost" size="sm"><Link href="/dashboard/notifications">All</Link></Button></div>
            {notifs.length ? notifs.map((n) => (
              <div key={n.id} className={`flex gap-3 border-b px-5 py-3 last:border-0 ${n.is_read ? "" : "bg-primary/5"}`}>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Bell className="size-4" /></span>
                <div className="min-w-0"><p className="text-xs font-semibold">{n.title}</p><p className="truncate text-xs text-muted-foreground">{n.message}</p><p className="text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</p></div>
              </div>
            )) : <p className="px-5 py-8 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>}
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Quick actions</h2>
            <div className="space-y-2">
              <Button asChild className="w-full"><Link href="/listings/new"><Plus className="size-4" /> List an item</Link></Button>
              <Button asChild variant="outline" className="w-full"><Link href="/explore"><Search className="size-4" /> Browse marketplace</Link></Button>
              <Button asChild variant="outline" className="w-full"><Link href="/dashboard/saved"><Heart className="size-4" /> Saved items ({saved})</Link></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
