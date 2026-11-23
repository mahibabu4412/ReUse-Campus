"use server";

import { revalidatePath } from "next/cache";
import { currentStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addNotification } from "@/lib/queries";
import { contactSchema, reportSchema } from "@/lib/validation";

export type FormState = { error?: string; success?: string };

export async function sendContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input." };
  }
  const student = await currentStudent();
  await prisma.contact_messages.create({
    data: { ...parsed.data, user_id: student?.id ?? null },
  });
  return { success: "Message sent. We will get back to you soon." };
}

export async function reportListing(formData: FormData) {
  try {
    const student = await currentStudent();
    if (!student) return;
    const parsed = reportSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return;
    const listing = await prisma.listings.findUnique({ where: { id: parsed.data.listing_id } });
    if (!listing || listing.user_id === student.id) return;
    const duplicate = await prisma.reports.findFirst({
      where: {
        reporter_id: student.id, listing_id: listing.id,
        status: { in: ["pending", "reviewed"] },
      },
    });
    if (duplicate) return;
    await prisma.reports.create({
      data: {
        reporter_id: student.id, listing_id: listing.id,
        reported_user_id: listing.user_id, reason: parsed.data.reason,
        details: parsed.data.details || null,
      },
    });
    revalidatePath(`/listing/${listing.id}`);
  } catch { /* ignore */ }
}

export async function markReportRead(formData: FormData) {
  const student = await currentStudent();
  if (!student) return;
  await prisma.notifications.updateMany({ where: { user_id: student.id }, data: { is_read: true } });
  revalidatePath("/dashboard/notifications");
}
