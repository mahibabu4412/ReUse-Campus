import Link from "next/link";
import { MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/favorite-button";
import { conditionLabel, exchangeLabel, exchangeTone, formatMoney, imageUrl, initials, timeAgo } from "@/lib/format";
import type { listings, categories, users, listing_images } from "@prisma/client";

export type ListingCardData = listings & {
  categories: categories;
  users: Pick<users, "id" | "full_name" | "profile_picture">;
  listing_images: listing_images[];
};

export function ListingCard({ listing, saved = false }: { listing: ListingCardData; saved?: boolean }) {
  const image = listing.listing_images[0]?.filename;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/listing/${listing.id}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl(image)} alt={listing.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <Badge className={`absolute left-3 top-3 ${exchangeTone(listing.exchange_type)}`}>{exchangeLabel(listing.exchange_type)}</Badge>
      </Link>
      <div className="absolute right-3 top-3">
        <FavoriteButton listingId={listing.id} initialSaved={saved} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-[11px] font-semibold text-primary">{listing.categories.name}</span>
        <Link href={`/listing/${listing.id}`} className="line-clamp-2 min-h-10 font-semibold leading-snug hover:text-primary">{listing.title}</Link>
        <span className={`text-lg font-bold ${listing.exchange_type === "donation" ? "text-primary" : ""}`}>
          {formatMoney(listing.price, listing.exchange_type)}
        </span>
        <div className="mt-auto flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Tag className="size-3" /> {conditionLabel(listing.item_condition)}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {listing.pickup_location || "Campus"}</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">{initials(listing.users.full_name)}</span>
          {listing.users.full_name.split(" ")[0]}
        </span>
        <span>{timeAgo(listing.created_at)}</span>
      </div>
    </article>
  );
}
