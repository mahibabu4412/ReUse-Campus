import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingForm } from "@/components/listing-form";
import { deleteListing, deleteListingImage } from "@/actions/listings";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/queries";
import { imageUrl } from "@/lib/format";

export const metadata = { title: "Edit listing" };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const student = await requireStudent();
  const { id: raw } = await params;
  const id = Number(raw);
  const [listing, categories] = await Promise.all([
    prisma.listings.findUnique({ where: { id }, include: { listing_images: true } }),
    getCategories(),
  ]);
  if (!listing || listing.user_id !== student.id) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-semibold">Edit listing</h1><p className="text-sm text-muted-foreground">Keep your listing accurate and up to date.</p></div>
        <Button asChild variant="outline" size="sm"><Link href={`/listing/${id}`}>View public page</Link></Button>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="mb-3 text-sm font-medium">Current images</p>
        <div className="mb-6 flex flex-wrap gap-3">
          {listing.listing_images.map((img) => (
            <div key={img.id} className="relative size-20 overflow-hidden rounded-xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl(img.filename)} alt="" className="size-full object-cover" />
              <form action={deleteListingImage}>
                <input type="hidden" name="id" value={img.id} />
                <button type="submit" className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white" aria-label="Remove image"><Trash2 className="size-3" /></button>
              </form>
            </div>
          ))}
        </div>
        <ListingForm
          categories={categories} listingId={id}
          initialValues={{
            title: listing.title, description: listing.description, category_id: listing.category_id,
            item_condition: listing.item_condition, exchange_type: listing.exchange_type,
            price: Number(listing.price), availability: listing.availability,
            pickup_location: listing.pickup_location,
          }}
        />
      </div>
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 dark:border-rose-900/40 dark:bg-rose-950/10">
        <form action={deleteListing}><input type="hidden" name="id" value={id} /><Button type="submit" variant="destructive" size="sm"><Trash2 className="size-4" /> Remove listing</Button></form>
      </div>
    </div>
  );
}
