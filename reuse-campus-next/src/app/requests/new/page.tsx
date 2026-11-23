import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RequestForm } from "@/components/request-form";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getListingById } from "@/lib/queries";
import { exchangeLabel, imageUrl } from "@/lib/format";

export const metadata = { title: "Request item" };

export default async function NewRequestPage({ searchParams }: { searchParams: Promise<{ listing?: string }> }) {
  const student = await requireStudent();
  const { listing: raw } = await searchParams;
  const id = Number(raw);
  const listing = await getListingById(id);
  if (!listing || listing.status !== "active") notFound();
  if (listing.user_id === student.id) redirect(`/listing/${id}`);
  const existing = await prisma.item_requests.findFirst({
    where: { listing_id: id, requester_id: student.id, status: { in: ["pending", "accepted"] } },
  });
  if (existing) redirect("/dashboard/requests");

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Request this item</h1>
      <div className="my-5 flex items-center gap-4 border-b pb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl(listing.listing_images[0]?.filename)} alt="" className="size-20 rounded-xl object-cover" />
        <div><Link href={`/listing/${id}`} className="font-semibold hover:text-primary">{listing.title}</Link><p className="text-xs text-muted-foreground">{exchangeLabel(listing.exchange_type)} · {listing.pickup_location || "Campus"}</p></div>
      </div>
      <RequestForm listingId={id} needsReturnDate={listing.exchange_type === "borrow"} />
    </div>
  );
}
