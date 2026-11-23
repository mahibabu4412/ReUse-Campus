import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Eye, Flag, MapPin, Clock3, Tag, Layers, Repeat2, Sparkles, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favorite-button";
import { matchListings } from "@/lib/matching";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getListingById, incrementViews, isFavorite } from "@/lib/queries";
import { reportListing } from "@/actions/misc";
import { conditionLabel, exchangeLabel, exchangeTone, formatMoney, imageUrl, initials, statusTone, timeAgo } from "@/lib/format";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!id || Number.isNaN(id)) notFound();
  const listing = await getListingById(id);
  if (!listing || listing.status !== "active") notFound();
  await incrementViews(id);

  const session = await auth();
  const uid = session?.user?.role === "student" ? Number(session.user.id) : undefined;
  const [saved, existing, related, reviews, rating] = await Promise.all([
    isFavorite(uid, id),
    uid ? prisma.item_requests.findFirst({
      where: { listing_id: id, requester_id: uid, status: { in: ["pending", "accepted"] } },
      orderBy: { id: "desc" },
    }) : null,
    matchListings({
      id, category_id: listing.category_id, exchange_type: listing.exchange_type,
      title: listing.title, owner_college: listing.users.college,
    }),
    prisma.reviews.findMany({
      where: { reviewed_user_id: listing.user_id }, orderBy: { created_at: "desc" }, take: 5,
      include: { users_reviews_reviewer_idTousers: { select: { full_name: true } } },
    }),
    prisma.reviews.aggregate({ where: { reviewed_user_id: listing.user_id }, _avg: { rating: true }, _count: true }),
  ]);

  const isOwner = uid === listing.user_id;
  const images = listing.listing_images.length ? listing.listing_images : [{ filename: "images/placeholder.svg" }];
  const detailRows: [LucideIcon, string, string][] = [
    [Layers, "Category", listing.categories.name],
    [Tag, "Condition", conditionLabel(listing.item_condition)],
    [Repeat2, "Exchange type", exchangeLabel(listing.exchange_type)],
    [CheckCircle2, "Availability", listing.availability],
    [MapPin, "Pickup location", listing.pickup_location || "Campus"],
    ...(listing.exchange_type === "borrow"
      ? ([[CalendarDays, "Return date", "Agreed between students"]] as [LucideIcon, string, string][])
      : []),
  ];

  return (
    <>
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <nav className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link><span>/</span>
            <Link href="/explore" className="hover:text-primary">Explore</Link><span>/</span>
            <Link href={`/explore?category=${listing.category_id}`} className="hover:text-primary">{listing.categories.name}</Link><span>/</span><span>Details</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_.9fr]">
        {/* GALLERY + DESCRIPTION (client gallery via CSS only: first image + thumbs as links) */}
        <div>
          <div className="rounded-3xl border bg-card p-4 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(images[0].filename)} alt={listing.title} className="aspect-[4/3] w-full rounded-2xl object-cover" />
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <a key={("id" in img && img.id) ? img.id : i} href={imageUrl(img.filename)} target="_blank" rel="noreferrer" className="size-16 shrink-0 overflow-hidden rounded-xl border-2 border-transparent hover:border-primary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl(img.filename)} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="mt-5 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">Description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{listing.description}</p>
          </div>
          {reviews.length > 0 && (
            <div className="mt-5 rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="font-semibold">Reviews from exchanges</h2>
              <div className="mt-3 divide-y">
                {reviews.map((r) => <div key={r.id} className="py-3 text-sm"><span className="text-amber-500">{"★".repeat(r.rating)}</span><p className="mt-1 text-muted-foreground">{r.comment}</p><p className="mt-1 text-xs text-muted-foreground">— {r.users_reviews_reviewer_idTousers.full_name}</p></div>)}
              </div>
            </div>
          )}
        </div>

        {/* INFO */}
        <aside>
          <Badge className={exchangeTone(listing.exchange_type)}>{exchangeLabel(listing.exchange_type)}</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{listing.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{conditionLabel(listing.item_condition)}</Badge>
            <Badge className={statusTone(listing.availability)}>{listing.availability}</Badge>
          </div>
          <p className="mt-5 text-3xl font-bold text-primary">{formatMoney(listing.price, listing.exchange_type)}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Eye className="size-3.5" /> {listing.views} views</span>
            <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" /> {timeAgo(listing.created_at)}</span>
            <span className="inline-flex items-center gap-1"><Tag className="size-3.5" /> {listing.categories.name}</span>
          </div>

          <div className="mt-6 flex gap-2">
            {isOwner ? (
              <Button asChild variant="outline" className="flex-1"><Link href="/dashboard/listings">Manage this listing</Link></Button>
            ) : existing ? (
              <Button asChild variant="outline" className="flex-1"><Link href="/dashboard/requests">Request {existing.status}</Link></Button>
            ) : (
              <Button asChild className="flex-1" size="lg"><Link href={`/requests/new?listing=${id}`}>Request item</Link></Button>
            )}
            <FavoriteButton listingId={id} initialSaved={saved} className="size-11 rounded-xl" />
          </div>

          <div className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Item details</h2>
            {detailRows.map(([Icon, label, value], i) => (
              <div key={i} className="flex items-center gap-3 border-b py-2.5 text-sm last:border-0">
                <Icon className="size-4 text-primary" /><span className="text-muted-foreground">{label}</span><span className="ml-auto text-right font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">Listed by</h2>
            <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-4">
              <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">{initials(listing.users.full_name)}</span>
              <div><p className="text-sm font-semibold">{listing.users.full_name}</p><p className="text-xs text-muted-foreground">{listing.users.college || "ReUse Campus member"}</p><p className="text-xs text-muted-foreground">{listing.users.department}</p></div>
            </div>
            {rating._count > 0 && <p className="mt-3 text-xs text-muted-foreground">★ {rating._avg.rating?.toFixed(1)} from {rating._count} exchange{rating._count > 1 ? "s" : ""}</p>}
            {uid && !isOwner && (
              <form action={reportListing} className="mt-4 border-t pt-4">
                <input type="hidden" name="listing_id" value={id} />
                <select name="reason" className="w-full rounded-lg border bg-background px-3 py-2 text-xs" defaultValue="inappropriate">
                  <option value="inappropriate">Inappropriate content</option><option value="spam">Spam or scam</option>
                  <option value="misleading">Misleading information</option><option value="other">Other</option>
                </select>
                <Button type="submit" variant="ghost" size="sm" className="mt-2 w-full text-muted-foreground"><Flag className="size-3.5" /> Report this listing</Button>
              </form>
            )}
          </div>

          {related.length > 0 && (
            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary">
              <p className="flex items-center gap-1.5 font-semibold"><Sparkles className="size-3.5" /> Why these recommendations?</p>
              <p className="mt-1">Matched by category, exchange preference, shared college and title keywords. Rule-based only — no AI is used.</p>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="border-t bg-card py-12">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight">Related resources</h2>
            <p className="mt-1 text-sm text-muted-foreground">Items matched to this listing using our rule-based engine.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <Link key={r.id} href={`/listing/${r.id}`} className="rounded-2xl border bg-background p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl(r.image)} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
                  <p className="mt-3 text-[11px] font-semibold text-primary">Match score: {r.match_score}%</p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold">{r.title}</p>
                  <p className="mt-1 text-sm font-bold">{formatMoney(r.price, r.exchange_type)}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">✓ {r.match_reasons.join(" · ")}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
