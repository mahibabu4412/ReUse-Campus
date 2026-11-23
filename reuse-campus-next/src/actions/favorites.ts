"use server";

import { revalidatePath } from "next/cache";
import { currentStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFavorite(listingId: number) {
  const student = await currentStudent();
  if (!student) return { error: "Please log in to save items." };

  const existing = await prisma.favorites.findUnique({
    where: { user_id_listing_id: { user_id: student.id, listing_id: listingId } },
  });
  if (existing) {
    await prisma.favorites.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard/saved");
    revalidatePath("/explore");
    return { saved: false };
  }
  await prisma.favorites.create({ data: { user_id: student.id, listing_id: listingId } });
  revalidatePath("/dashboard/saved");
  revalidatePath("/explore");
  return { saved: true };
}
