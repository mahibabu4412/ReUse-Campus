"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentStudent, requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addNotification } from "@/lib/queries";
import { requestSchema } from "@/lib/validation";

export type RequestState = { error?: string; success?: string };

export async function createRequest(_prev: RequestState, formData: FormData): Promise<RequestState> {
  try {
    const student = await requireStudent();
    const parsed = requestSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input." };
    }
    const { listing_id, message, expected_return_date } = parsed.data;
    const listing = await prisma.listings.findUnique({ where: { id: listing_id } });
    if (!listing || listing.status !== "active") return { error: "This listing is not available." };
    if (listing.user_id === student.id) return { error: "You cannot request your own item." };

    const existing = await prisma.item_requests.findFirst({
      where: { listing_id, requester_id: student.id, status: { in: ["pending", "accepted"] } },
    });
    if (existing) return { error: "You already have an active request for this item." };

    if (listing.exchange_type === "borrow" && !expected_return_date) {
      return { error: "Please provide an expected return date." };
    }
    if (expected_return_date && new Date(expected_return_date) < new Date(new Date().toDateString())) {
      return { error: "Return date cannot be in the past." };
    }

    await prisma.item_requests.create({
      data: {
        listing_id, requester_id: student.id, owner_id: listing.user_id,
        message, expected_return_date: expected_return_date ? new Date(expected_return_date) : null,
        status: "pending",
      },
    });
    await addNotification(listing.user_id, "New item request",
      `${student.full_name} requested “${listing.title}”.`, "request", "/dashboard/incoming");
    revalidatePath("/dashboard/incoming");
    revalidatePath("/dashboard/requests");
    redirect("/dashboard/requests?sent=1");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: err instanceof Error ? err.message : "Could not send request." };
  }
}

export async function manageRequest(formData: FormData) {
  try {
    const student = await requireStudent();
    const id = Number(formData.get("request_id"));
    const action = String(formData.get("action"));
    const req = await prisma.item_requests.findUnique({
      where: { id },
      include: { listings: true },
    });
    if (!req) return;
    const isOwner = req.owner_id === student.id;
    const isRequester = req.requester_id === student.id;
    if (!isOwner && !isRequester) return;
    const title = req.listings.title;

    if (action === "accept" && isOwner && req.status === "pending") {
      await prisma.item_requests.update({ where: { id }, data: { status: "accepted" } });
      await prisma.listings.update({ where: { id: req.listing_id }, data: { availability: "reserved" } });
      await addNotification(req.requester_id, "Request accepted",
        `Your request for “${title}” was accepted by ${student.full_name}.`, "request", "/dashboard/requests");
    } else if (action === "reject" && isOwner && req.status === "pending") {
      await prisma.item_requests.update({ where: { id }, data: { status: "rejected" } });
      await addNotification(req.requester_id, "Request update",
        `Your request for “${title}” was not accepted.`, "request", "/dashboard/requests");
    } else if (action === "cancel" && isRequester && req.status === "pending") {
      await prisma.item_requests.update({ where: { id }, data: { status: "cancelled" } });
      await addNotification(req.owner_id, "Request cancelled",
        `${student.full_name} cancelled their request for “${title}”.`, "request", "/dashboard/incoming");
    } else if (action === "complete" && req.status === "accepted") {
      if (req.listings.exchange_type === "borrow" && !isOwner) return; // owner confirms return
      await prisma.item_requests.update({ where: { id }, data: { status: "completed", return_confirmed: true } });
      await prisma.listings.update({
        where: { id: req.listing_id }, data: { availability: "completed", status: "sold" },
      });
      await prisma.exchange_history.create({
        data: {
          listing_id: req.listing_id, requester_id: req.requester_id,
          owner_id: req.owner_id, exchange_type: req.listings.exchange_type,
        },
      });
      const other = isOwner ? req.requester_id : req.owner_id;
      await addNotification(other, "Exchange completed",
        `The exchange for “${title}” was marked complete.`, "exchange", "/dashboard/history");
      revalidatePath("/dashboard/history");
    }
    revalidatePath("/dashboard/requests");
    revalidatePath("/dashboard/incoming");
    revalidatePath("/dashboard/notifications");
  } catch { /* unauthorized actions silently ignored */ }
}

export async function markNotificationsRead(formData: FormData) {
  const student = await currentStudent();
  if (!student) return;
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.notifications.updateMany({ where: { id, user_id: student.id }, data: { is_read: true } });
  } else {
    await prisma.notifications.updateMany({ where: { user_id: student.id }, data: { is_read: true } });
  }
  revalidatePath("/dashboard/notifications");
}
