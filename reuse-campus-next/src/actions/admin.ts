"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validation";

async function adminGuard() {
  try { await requireAdminSession(); } catch { throw new Error("UNAUTHORIZED"); }
}

export async function setUserStatus(formData: FormData) {
  await adminGuard();
  const id = Number(formData.get("id"));
  const action = String(formData.get("action"));
  if (!id) return;
  await prisma.users.update({
    where: { id },
    data: { status: action === "suspend_user" ? "suspended" : "active" },
  });
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function setListingStatus(formData: FormData) {
  await adminGuard();
  const id = Number(formData.get("id"));
  const action = String(formData.get("action"));
  const map: Record<string, "active" | "removed" | "pending"> = {
    approve_listing: "active", remove_listing: "removed", pend_listing: "pending",
  };
  if (!id || !map[action]) return;
  await prisma.listings.update({ where: { id }, data: { status: map[action] } });
  revalidatePath("/admin/listings");
  revalidatePath(`/listing/${id}`);
  revalidatePath("/admin");
}

export async function reviewReport(formData: FormData) {
  await adminGuard();
  const id = Number(formData.get("id"));
  const action = String(formData.get("action"));
  const map: Record<string, "reviewed" | "resolved" | "dismissed"> = {
    review_report: "reviewed", resolve_report: "resolved", dismiss_report: "dismissed",
  };
  if (!id || !map[action]) return;
  await prisma.reports.update({
    where: { id },
    data: { status: map[action], admin_note: String(formData.get("admin_note") ?? "") || null },
  });
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
}

export async function saveCategory(formData: FormData) {
  await adminGuard();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const d = parsed.data;
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.categories.update({ where: { id }, data: { ...d } });
  } else {
    const duplicate = await prisma.categories.findUnique({ where: { slug: d.slug } });
    if (!duplicate) await prisma.categories.create({ data: { ...d, status: "active" } });
  }
  revalidatePath("/admin/categories");
  revalidatePath("/explore");
}

export async function deleteCategory(formData: FormData) {
  await adminGuard();
  const id = Number(formData.get("id"));
  if (!id) return;
  const used = await prisma.listings.count({ where: { category_id: id } });
  if (used) return;
  await prisma.categories.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export async function manageMessage(formData: FormData) {
  await adminGuard();
  const id = Number(formData.get("id"));
  const action = String(formData.get("action"));
  if (!id) return;
  if (action === "message_delete") await prisma.contact_messages.delete({ where: { id } });
  else await prisma.contact_messages.update({
    where: { id }, data: { is_read: action === "message_read" },
  });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
