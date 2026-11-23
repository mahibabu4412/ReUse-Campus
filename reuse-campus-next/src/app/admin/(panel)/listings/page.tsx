import Link from "next/link";
import { Check, Eye, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/pagination";
import { setListingStatus } from "@/actions/admin";
import { prisma } from "@/lib/prisma";
import { exchangeLabel, exchangeTone, imageUrl, statusTone, timeAgo, STATUS_LABELS } from "@/lib/format";
import type { Prisma } from "@prisma/client";

export const metadata = { title: "Listing moderation" };

const STATUSES = ["all", "active", "pending", "removed", "sold"] as const;

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "all";
  const page = Number(sp.page) || 1;
  const per = 15;
  const where: Prisma.listingsWhereInput = {
    ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : {}),
    ...(status !== "all" ? { status: status as "active" } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.listings.count({ where }),
    prisma.listings.findMany({
      where, orderBy: { created_at: "desc" }, skip: (page - 1) * per, take: per,
      include: { users: { select: { full_name: true } }, categories: true, listing_images: { take: 1 } },
    }),
  ]);

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4"><h1 className="text-lg font-semibold">Listing moderation <span className="text-sm font-normal text-muted-foreground">({total})</span></h1><p className="text-xs text-muted-foreground">Approve, remove or review resources posted by students.</p></div>
      <form action="/admin/listings" method="get" className="flex flex-wrap gap-3 border-b p-4">
        <div className="relative min-w-56 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input name="q" defaultValue={q} placeholder="Search listings..." className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm" /></div>
        <select name="status" defaultValue={status} className="rounded-xl border bg-background px-3 py-2 text-sm">{STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All" : s === "pending" ? "Pending review" : s}</option>)}</select>
        <Button type="submit" size="sm">Search</Button>
      </form>
      <div className="overflow-x-auto p-5">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="pb-3">Item</th><th className="pb-3">Owner</th><th className="pb-3">Category</th><th className="pb-3">Type</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead>
          <tbody className="divide-y">
            {rows.map((l) => (
              <tr key={l.id} className="hover:bg-muted/40">
                <td className="py-3"><div className="flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={imageUrl(l.listing_images[0]?.filename)} alt="" className="size-11 rounded-lg object-cover" /><div><Link href={`/listing/${l.id}`} className="font-medium hover:text-primary">{l.title}</Link><p className="text-[11px] text-muted-foreground">{timeAgo(l.created_at)}</p></div></div></td>
                <td className="text-xs text-muted-foreground">{l.users.full_name}</td>
                <td className="text-xs text-muted-foreground">{l.categories.name}</td>
                <td><Badge className={exchangeTone(l.exchange_type)}>{exchangeLabel(l.exchange_type)}</Badge></td>
                <td><Badge className={statusTone(l.status)}>{STATUS_LABELS[l.status]}</Badge></td>
                <td><div className="flex gap-1">
                  <Button asChild variant="ghost" size="icon" className="size-8"><Link href={`/listing/${l.id}`}><Eye className="size-4" /></Link></Button>
                  {l.status !== "active" && <form action={setListingStatus}><input type="hidden" name="id" value={l.id} /><Button type="submit" name="action" value="approve_listing" variant="ghost" size="icon" className="size-8"><Check className="size-4" /></Button></form>}
                  {l.status !== "removed" && <form action={setListingStatus}><input type="hidden" name="id" value={l.id} /><Button type="submit" name="action" value="remove_listing" variant="ghost" size="icon" className="size-8 text-rose-600"><Trash2 className="size-4" /></Button></form>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 pb-5"><Pagination page={page} pages={Math.max(1, Math.ceil(total / per))} hrefFor={(p) => `/admin/listings?page=${p}&q=${encodeURIComponent(q)}&status=${status}`} /></div>
    </div>
  );
}
