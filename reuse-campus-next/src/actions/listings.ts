"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSchema } from "@/lib/validation";
import { saveManyUploads } from "@/lib/upload";

export type ListingActionState = { error?: string; success?: string };

function parse(formData: FormData) {
  return listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category_id: formData.get("category_id"),
    item_condition: formData.get("item_condition"),
    exchange_type: formData.get("exchange_type"),
    price: formData.get("price") ?? 0,
    availability: formData.get("availability") ?? "available",
    pickup_location: formData.get("pickup_location") ?? "",
  });
}

export async function createListing(_prev: ListingActionState, formData: FormData): Promise<ListingActionState> {
  try {
    const student = await requireStudent();
    const parsed = parse(formData);
    if (!parsed.success) {
      return { error: Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input." };
    }
    const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
    const paths = await saveManyUploads(files);
    if (paths.length === 0) return { error: "Add at least one valid image (JPG, PNG, GIF or WEBP, max 5 MB)." };

    const d = parsed.data;
    const listing = await prisma.listings.create({
      data: {
        user_id: student.id,
        category_id: d.category_id,
        title: d.title,
        description: d.description,
        item_condition: d.item_condition,
        exchange_type: d.exchange_type,
        price: d.exchange_type === "sale" ? d.price : 0,
        availability: d.availability,
        pickup_location: d.pickup_location || null,
        status: "active",
        listing_images: {
          create: paths.map((filename, i) => ({ filename, is_primary: i === 0 })),
        },
      },
    });
    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/dashboard/listings");
    redirect(`/listing/${listing.id}?created=1`);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: err instanceof Error ? err.message : "Could not create listing." };
  }
}

export async function updateListing(id: number, _prev: ListingActionState, formData: FormData): Promise<ListingActionState> {
  try {
    const student = await requireStudent();
    const listing = await prisma.listings.findUnique({ where: { id } });
    if (!listing || listing.user_id !== student.id) return { error: "You cannot edit this listing." };

    const parsed = parse(formData);
    if (!parsed.success) return { error: Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input." };
    const d = parsed.data;

    await prisma.listings.update({
      where: { id },
      data: {
        category_id: d.category_id, title: d.title, description: d.description,
        item_condition: d.item_condition, exchange_type: d.exchange_type,
        price: d.exchange_type === "sale" ? d.price : 0,
        availability: d.availability, pickup_location: d.pickup_location || null,
      },
    });

    const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
    const paths = await saveManyUploads(files);
    if (paths.length) {
      await prisma.listing_images.createMany({
        data: paths.map((filename) => ({ listing_id: id, filename, is_primary: false })),
      });
    }
    revalidatePath(`/listing/${id}`);
    revalidatePath("/dashboard/listings");
    return { success: "Listing updated." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update listing." };
  }
}

export async function deleteListingImage(formData: FormData) {
  try {
    const student = await requireStudent();
    const id = Number(formData.get("id"));
    const image = await prisma.listing_images.findUnique({ where: { id } });
    if (!image) return;
    const listing = await prisma.listings.findUnique({ where: { id: image.listing_id } });
    if (!listing || listing.user_id !== student.id) return;
    const count = await prisma.listing_images.count({ where: { listing_id: image.listing_id } });
    if (count <= 1) return;
    await prisma.listing_images.delete({ where: { id } });
    revalidatePath(`/listings/${image.listing_id}/edit`);
  } catch { /* ignore */ }
}

export async function deleteListing(formData: FormData) {
  try {
    const student = await requireStudent();
    const id = Number(formData.get("id"));
    const listing = await prisma.listings.findUnique({ where: { id } });
    if (!listing || listing.user_id !== student.id) return;
    await prisma.listings.update({ where: { id }, data: { status: "removed" } });
    revalidatePath("/dashboard/listings");
    redirect("/dashboard/listings?status=removed");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
  }
}
