import { StatCard } from "@/components/stat-card";
import { BarChart3, CheckCircle2, Package, Send, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Platform analytics" };

export default async function AdminAnalyticsPage() {
  const [users, listings, requests, exchanges, topCats, reqStatus, colleges] = await Promise.all([
    prisma.users.count(), prisma.listings.count(), prisma.item_requests.count(),
    prisma.exchange_history.count(),
    prisma.categories.findMany({
      orderBy: { listings: { _count: "desc" } }, take: 6,
      select: { name: true, _count: { select: { listings: true } } },
    }),
    prisma.item_requests.groupBy({ by: ["status"], _count: true }),
    prisma.users.groupBy({ by: ["college"], _count: true, orderBy: { _count: { college: "desc" } }, take: 6 }),
  ]);

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (11 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("en", { month: "short" }), users: 0, listings: 0, requests: 0 };
  });
  const bucket = (date: Date, field: "users" | "listings" | "requests") => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const m = months.find((x) => x.key === key); if (m) m[field]++;
  };
  const [allUsers, allListings, allRequests] = await Promise.all([
    prisma.users.findMany({ select: { created_at: true } }),
    prisma.listings.findMany({ select: { created_at: true } }),
    prisma.item_requests.findMany({ select: { created_at: true } }),
  ]);
  allUsers.forEach((r) => bucket(r.created_at, "users"));
  allListings.forEach((r) => bucket(r.created_at, "listings"));
  allRequests.forEach((r) => bucket(r.created_at, "requests"));
  const max = Math.max(1, ...months.flatMap((m) => [m.users, m.listings, m.requests]));
  const maxCat = Math.max(1, ...topCats.map((c) => c._count.listings));
  const maxCollege = Math.max(1, ...colleges.map((c) => c._count));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total students" value={users} />
        <StatCard icon={Package} label="All listings" value={listings} />
        <StatCard icon={Send} label="Total requests" value={requests} />
        <StatCard icon={CheckCircle2} label="Exchanges completed" value={exchanges} />
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">Platform growth</h2><span className="flex items-center gap-1 text-xs text-muted-foreground"><BarChart3 className="size-3.5" /> Last 12 months · live data</span></div>
        <div className="flex h-48 items-end justify-between gap-1">
          {months.map((m) => (
            <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-40 w-full items-end justify-center gap-[2px]">
                <div className="w-1/3 max-w-4 rounded-t bg-emerald-300" style={{ height: `${Math.max(2, (m.users / max) * 145)}px` }} title={`${m.users} students`} />
                <div className="w-1/3 max-w-4 rounded-t bg-primary" style={{ height: `${Math.max(2, (m.listings / max) * 145)}px` }} title={`${m.listings} listings`} />
                <div className="w-1/3 max-w-4 rounded-t bg-green-900" style={{ height: `${Math.max(2, (m.requests / max) * 145)}px` }} title={`${m.requests} requests`} />
              </div>
              <span className="text-[9px] text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">■ Students&nbsp; ■ Listings&nbsp; ■ Requests</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Top categories</h2>
          {topCats.map((c) => <div key={c.name} className="mb-3"><div className="mb-1 flex justify-between text-xs"><b>{c.name}</b><span className="text-muted-foreground">{c._count.listings}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(c._count.listings / maxCat) * 100}%` }} /></div></div>)}
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Request status breakdown</h2>
          {reqStatus.map((s) => <div key={s.status} className="mb-3"><div className="mb-1 flex justify-between text-xs"><b className="capitalize">{s.status}</b><span className="text-muted-foreground">{s._count} ({Math.round((s._count / Math.max(1, requests)) * 100)}%)</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(s._count / Math.max(1, requests)) * 100}%` }} /></div></div>)}
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="border-b px-5 py-4"><h2 className="font-semibold">Campus reach</h2><p className="text-xs text-muted-foreground">Students by college</p></div>
        <table className="w-full text-sm"><thead className="border-b text-left text-xs uppercase text-muted-foreground"><tr><th className="p-4">College</th><th className="p-4">Students</th><th className="p-4">Share</th></tr></thead>
          <tbody className="divide-y">{colleges.map((c) => <tr key={c.college}><td className="p-4 font-medium">{c.college || "—"}</td><td className="p-4">{c._count}</td><td className="p-4 text-muted-foreground">{Math.round((c._count / Math.max(1, users)) * 100)}%</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
