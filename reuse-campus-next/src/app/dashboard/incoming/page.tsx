import Link from "next/link";
import { CalendarDays, Check, Handshake, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { manageRequest } from "@/actions/requests";
import { exchangeLabel, imageUrl, statusTone, timeAgo, STATUS_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Incoming requests" };

const STATUSES = ["pending", "accepted", "completed", "rejected", "cancelled", "all"] as const;

export default async function IncomingRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const student = await requireStudent();
  const { status: raw } = await searchParams;
  const status = (STATUSES as readonly string[]).includes(raw ?? "") ? raw! : "pending";
  const [rows, pending] = await Promise.all([
    prisma.item_requests.findMany({
      where: { owner_id: student.id, ...(status !== "all" ? { status: status as "pending" } : {}) },
      orderBy: { created_at: "desc" },
      include: {
        listings: { select: { title: true, exchange_type: true, listing_images: { take: 1 } } },
        users_item_requests_requester_idTousers: { select: { full_name: true, college: true } },
      },
    }),
    prisma.item_requests.count({ where: { owner_id: student.id, status: "pending" } }),
  ]);

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div><h1 className="flex items-center gap-2 text-lg font-semibold">Incoming requests {pending > 0 && <Badge className="bg-amber-100 text-amber-700">{pending} new</Badge>}</h1><p className="text-xs text-muted-foreground">Requests from students interested in your listings.</p></div>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b px-4">
        {STATUSES.map((s) => <Link key={s} href={`/dashboard/incoming?status=${s}`} className={cn("border-b-2 px-4 py-3 text-sm font-medium capitalize", status === s ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{s}</Link>)}
      </div>
      <div className="space-y-3 p-5">
        {rows.length ? rows.map((r) => (
          <div key={r.id} className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(r.listings.listing_images[0]?.filename)} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><Link href={`/listing/${r.listing_id}`} className="font-semibold hover:text-primary">{r.listings.title}</Link><Badge className={statusTone(r.status)}>{STATUS_LABELS[r.status]}</Badge></div>
              <p className="mt-1 text-xs text-muted-foreground">From <b>{r.users_item_requests_requester_idTousers.full_name}</b> · {r.users_item_requests_requester_idTousers.college} · {exchangeLabel(r.listings.exchange_type)}</p>
              {r.message && <p className="mt-2 rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">“{r.message}”</p>}
              {r.expected_return_date && <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> Expected return: {r.expected_return_date.toLocaleDateString()}</p>}
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">{timeAgo(r.created_at)}</p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              {r.status === "pending" && (
                <>
                  <form action={manageRequest}><input type="hidden" name="request_id" value={r.id} /><input type="hidden" name="action" value="accept" /><Button type="submit" size="sm"><Check className="size-3.5" /> Accept</Button></form>
                  <form action={manageRequest}><input type="hidden" name="request_id" value={r.id} /><input type="hidden" name="action" value="reject" /><Button type="submit" variant="outline" size="sm"><X className="size-3.5" /> Reject</Button></form>
                </>
              )}
              {r.status === "accepted" && (
                <form action={manageRequest}><input type="hidden" name="request_id" value={r.id} /><input type="hidden" name="action" value="complete" /><Button type="submit" size="sm"><Handshake className="size-3.5" /> {r.listings.exchange_type === "borrow" ? "Confirm return" : "Mark complete"}</Button></form>
              )}
              {r.status === "completed" && <Badge className={statusTone("completed")}>✓ Completed</Badge>}
            </div>
          </div>
        )) : <EmptyState title="No incoming requests" description="When students request your items, they will appear here." actionLabel="Browse listings" actionHref="/explore" />}
      </div>
    </div>
  );
}
