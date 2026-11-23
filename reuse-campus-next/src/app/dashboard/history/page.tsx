import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exchangeLabel, exchangeTone, imageUrl } from "@/lib/format";

export const metadata = { title: "Exchange history" };

export default async function HistoryPage() {
  const student = await requireStudent();
  const rows = await prisma.exchange_history.findMany({
    where: { OR: [{ requester_id: student.id }, { owner_id: student.id }] },
    orderBy: { completed_at: "desc" },
    include: {
      listings: { select: { title: true, listing_images: { take: 1 } } },
      users_exchange_history_owner_idTousers: { select: { full_name: true } },
      users_exchange_history_requester_idTousers: { select: { full_name: true } },
    },
  });

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4"><div><h1 className="text-lg font-semibold">Exchange history</h1><p className="text-xs text-muted-foreground">A record of every completed exchange you took part in.</p></div><Badge className="bg-emerald-100 text-emerald-700">{rows.length} total</Badge></div>
      <div className="p-5">
        {rows.length ? (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="pb-3">Item</th><th className="pb-3">Type</th><th className="pb-3">With</th><th className="pb-3">Role</th><th className="pb-3">Completed</th></tr></thead>
            <tbody className="divide-y">
              {rows.map((h) => { const isOwner = h.owner_id === student.id; return (
                <tr key={h.id} className="hover:bg-muted/40">
                  <td className="py-3"><div className="flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={imageUrl(h.listings.listing_images[0]?.filename)} alt="" className="size-11 rounded-lg object-cover" /><Link href={`/listing/${h.listing_id}`} className="font-medium hover:text-primary">{h.listings.title}</Link></div></td>
                  <td><Badge className={exchangeTone(h.exchange_type)}>{exchangeLabel(h.exchange_type)}</Badge></td>
                  <td>{isOwner ? h.users_exchange_history_requester_idTousers.full_name : h.users_exchange_history_owner_idTousers.full_name}</td>
                  <td className="text-muted-foreground">{isOwner ? "Owner" : "Requester"}</td>
                  <td className="text-muted-foreground">{h.completed_at.toLocaleDateString()}</td>
                </tr>
              ); })}
            </tbody>
          </table></div>
        ) : <EmptyState title="No exchanges yet" description="Complete your first exchange and it will be recorded here." actionLabel="Explore marketplace" actionHref="/explore" />}
      </div>
    </div>
  );
}
