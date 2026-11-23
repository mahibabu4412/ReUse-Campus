import Link from "next/link";
import { BarChart3, Flag, Mail, Package, Repeat2, Users } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { exchangeLabel, exchangeTone, statusTone, timeAgo, STATUS_LABELS } from "@/lib/format";

export const metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  const [students, activeStudents, listings, pendingListings, exchanges, requests, pendingReports, unreadMessages, recentUsers, recentListings, recentReports, types] = await Promise.all([
    prisma.users.count(), prisma.users.count({ where: { status: "active" } }),
    prisma.listings.count({ where: { status: "active" } }), prisma.listings.count({ where: { status: "pending" } }),
    prisma.exchange_history.count(), prisma.item_requests.count(),
    prisma.reports.count({ where: { status: "pending" } }), prisma.contact_messages.count({ where: { is_read: false } }),
    prisma.users.findMany({ orderBy: { created_at: "desc" }, take: 5, select: { id: true, full_name: true, college: true, created_at: true, status: true } }),
    prisma.listings.findMany({ orderBy: { created_at: "desc" }, take: 5, select: { id: true, title: true, status: true, created_at: true, users: { select: { full_name: true } } } }),
    prisma.reports.findMany({ orderBy: { created_at: "desc" }, take: 5, select: { id: true, reason: true, status: true, created_at: true, listings: { select: { title: true } } } }),
    prisma.listings.groupBy({ by: ["exchange_type"], where: { status: "active" }, _count: true }),
  ]);

  // 6-month activity
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("en", { month: "short" }), users: 0, listings: 0 };
  });
  const [allUsers, allListings] = await Promise.all([
    prisma.users.findMany({ where: { created_at: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } }, select: { created_at: true } }),
    prisma.listings.findMany({ where: { created_at: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } }, select: { created_at: true } }),
  ]);
  const bucket = (date: Date, field: "users" | "listings") => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const m = months.find((x) => x.key === key); if (m) m[field]++;
  };
  allUsers.forEach((u) => bucket(u.created_at, "users"));
  allListings.forEach((l) => bucket(l.created_at, "listings"));
  const max = Math.max(1, ...months.flatMap((m) => [m.users, m.listings]));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Registered students" value={students} hint={`${activeStudents} active`} />
        <StatCard icon={Package} label="Active listings" value={listings} hint={`${pendingListings} pending`} />
        <StatCard icon={Repeat2} label="Completed exchanges" value={exchanges} hint={`${requests} requests`} />
        <StatCard icon={Flag} label="Pending reports" value={pendingReports} hint={`${unreadMessages} messages`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-semibold">Platform activity</h2><span className="text-xs text-muted-foreground">Last 6 months</span></div>
            <div className="flex h-44 items-end justify-between gap-3">
              {months.map((m) => (
                <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-36 w-full items-end justify-center gap-1">
                    <div className="w-1/3 max-w-5 rounded-t-md bg-emerald-300" style={{ height: `${Math.max(4, (m.users / max) * 130)}px` }} title={`${m.users} students`} />
                    <div className="w-1/3 max-w-5 rounded-t-md bg-primary" style={{ height: `${Math.max(4, (m.listings / max) * 130)}px` }} title={`${m.listings} listings`} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground"><span className="mr-3">■ Students</span><span>■ Listings</span></p>
          </div>

          <div className="rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4"><h2 className="font-semibold">Recent listings</h2><ButtonLink href="/admin/listings">Manage</ButtonLink></div>
            <div className="divide-y">
              {recentListings.map((l) => <div key={l.id} className="flex items-center gap-3 px-5 py-3 text-sm"><Link href={`/listing/${l.id}`} className="font-medium hover:text-primary">{l.title}</Link><span className="text-xs text-muted-foreground">{l.users.full_name}</span><Badge className={`ml-auto ${statusTone(l.status)}`}>{STATUS_LABELS[l.status]}</Badge><span className="text-[11px] text-muted-foreground">{timeAgo(l.created_at)}</span></div>)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">Exchange types</h2>
            {types.map((t) => {
              const pct = listings ? Math.round((t._count / listings) * 100) : 0;
              return <div key={t.exchange_type} className="mb-3"><div className="mb-1 flex justify-between text-xs"><span className="font-medium">{exchangeLabel(t.exchange_type)}</span><span className="text-muted-foreground">{t._count}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div></div>;
            })}
          </div>

          <div className="rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4"><h2 className="text-sm font-semibold">New students</h2><ButtonLink href="/admin/users">All</ButtonLink></div>
            {recentUsers.map((u) => <div key={u.id} className="flex items-center gap-3 border-b px-5 py-3 last:border-0 text-xs"><span className="grid size-8 place-items-center rounded-full bg-primary/10 font-bold text-primary">{u.full_name.charAt(0)}</span><div className="min-w-0"><p className="truncate font-semibold">{u.full_name}</p><p className="truncate text-muted-foreground">{u.college}</p></div><Badge className={`ml-auto ${statusTone(u.status)}`}>{STATUS_LABELS[u.status]}</Badge></div>)}
          </div>

          <div className="rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4"><h2 className="text-sm font-semibold">Reports</h2><ButtonLink href="/admin/reports">Review</ButtonLink></div>
            {recentReports.length ? recentReports.map((r) => <div key={r.id} className="flex items-center gap-3 border-b px-5 py-3 last:border-0 text-xs"><Flag className="size-4 text-primary" /><div className="min-w-0"><p className="font-semibold capitalize">{r.reason}</p><p className="truncate text-muted-foreground">{r.listings?.title || "Removed listing"}</p></div><Badge className={`ml-auto ${statusTone(r.status)}`}>{STATUS_LABELS[r.status]}</Badge></div>) : <p className="px-5 py-6 text-center text-xs text-muted-foreground">No reports yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="text-xs font-semibold text-primary hover:underline">{children}</Link>;
}
