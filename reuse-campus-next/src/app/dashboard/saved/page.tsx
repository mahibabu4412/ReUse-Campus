import Link from "next/link";
import { MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/favorite-button";
import { EmptyState } from "@/components/empty-state";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { conditionLabel, exchangeLabel, exchangeTone, formatMoney, imageUrl, timeAgo } from "@/lib/format";

export const metadata = { title: "Saved items" };

export default async function SavedPage() {
  const student = await requireStudent();
  const rows = await prisma.favorites.findMany({
    where: { user_id: student.id }, orderBy: { created_at: "desc" },
    include: {
      listings: {
        include: {
          categories: true,
          listing_images: { take: 1 },
          users: { select: { full_name: true } },
        },
      },
    },
  });
  const available = rows.filter((r) => r.listings.status === "active");

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4"><h1 className="text-lg font-semibold">Saved items</h1><Badge>{available.length} saved</Badge></div>
      <div className="p-5">
        {available.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {available.map(({ listings: l }) => (
              <article key={l.id} className="group relative overflow-hidden rounded-2xl border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <Link href={`/listing/${l.id}`} className="relative block aspect-[4/3] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl(l.listing_images[0]?.filename)} alt={l.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                  <Badge className={`absolute left-3 top-3 ${exchangeTone(l.exchange_type)}`}>{exchangeLabel(l.exchange_type)}</Badge>
                </Link>
                <div className="absolute right-3 top-3"><FavoriteButton listingId={l.id} initialSaved /></div>
                <div className="space-y-2 p-4">
                  <span className="text-[11px] font-semibold text-primary">{l.categories.name}</span>
                  <Link href={`/listing/${l.id}`} className="line-clamp-2 block font-semibold hover:text-primary">{l.title}</Link>
                  <p className="font-bold text-primary">{formatMoney(l.price, l.exchange_type)}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Tag className="size-3" />{conditionLabel(l.item_condition)}</span><span className="inline-flex items-center gap-1"><MapPin className="size-3" />{l.pickup_location || "Campus"}</span></div>
                  <p className="text-[11px] text-muted-foreground">Saved {timeAgo(l.created_at)}</p>
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState title="Nothing saved yet" description="Tap the heart on any listing to save it here for later." actionLabel="Explore marketplace" actionHref="/explore" />}
      </div>
    </div>
  );
}
