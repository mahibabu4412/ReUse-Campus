import Link from "next/link";
import { Eye, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exchangeLabel, exchangeTone, imageUrl, statusTone, timeAgo, STATUS_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "My listings" };

const STATUSES = ["active", "sold", "removed", "pending"] as const;

export default async function MyListingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const student = await requireStudent();
  const { status: raw } = await searchParams;
  const status = (STATUSES as readonly string[]).includes(raw ?? "") ? raw! : "active";

  const [rows, counts] = await Promise.all([
    prisma.listings.findMany({
      where: { user_id: student.id, status: status as "active" },
      orderBy: { created_at: "desc" },
      include: {
        categories: true,
        listing_images: { take: 1 },
        _count: { select: { item_requests: true } },
      },
    }),
    prisma.listings.groupBy({ by: ["status"], where: { user_id: student.id }, _count: true }),
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div><h1 className="text-lg font-semibold">My listings</h1><p className="text-xs text-muted-foreground">Manage everything you&apos;ve shared with the community.</p></div>
        <Button asChild size="sm"><Link href="/listings/new"><Plus className="size-4" /> New listing</Link></Button>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b px-4">
        {STATUSES.map((s) => (
          <Link key={s} href={`/dashboard/listings?status=${s}`} className={cn(
            "border-b-2 px-4 py-3 text-sm font-medium capitalize",
            status === s ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}>{s} <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{countMap[s] ?? 0}</span></Link>
        ))}
      </div>
      <div className="p-5">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="pb-3">Item</th><th className="pb-3">Category</th><th className="pb-3">Type</th><th className="pb-3">Status</th><th className="pb-3">Requests</th><th className="pb-3">Views</th><th className="pb-3" /></tr></thead>
              <tbody className="divide-y">
                {rows.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/40">
                    <td className="py-3"><div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl(l.listing_images[0]?.filename)} alt="" className="size-11 rounded-lg object-cover" />
                      <div><Link href={`/listing/${l.id}`} className="font-medium hover:text-primary">{l.title}</Link><p className="text-[11px] text-muted-foreground">{timeAgo(l.created_at)}</p></div>
                    </div></td>
                    <td className="text-muted-foreground">{l.categories.name}</td>
                    <td><Badge className={exchangeTone(l.exchange_type)}>{exchangeLabel(l.exchange_type)}</Badge></td>
                    <td><Badge className={statusTone(l.status)}>{STATUS_LABELS[l.status]}</Badge></td>
                    <td>{l._count.item_requests}</td><td>{l.views}</td>
                    <td><div className="flex gap-1"><Button asChild variant="ghost" size="icon" className="size-8"><Link href={`/listing/${l.id}`}><Eye className="size-4" /></Link></Button>{l.status === "active" && <Button asChild variant="ghost" size="icon" className="size-8"><Link href={`/listings/${l.id}/edit`}><Pencil className="size-4" /></Link></Button>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title={`No ${status} listings`} description="When you list resources, they will appear here." actionLabel="Create a listing" actionHref="/listings/new" />}
      </div>
    </div>
  );
}
