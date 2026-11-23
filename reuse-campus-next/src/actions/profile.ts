"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentStudent, requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation";
import { saveUpload } from "@/lib/upload";

export type ProfileState = { error?: string; success?: string };

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  try {
    const student = await requireStudent();
    const parsed = profileSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input." };
    }
    const d = parsed.data;
    const picture = formData.get("profile_picture");
    const profilePicture = picture instanceof File && picture.size > 0
      ? await saveUpload(picture, "profiles") : null;

    await prisma.users.update({
      where: { id: student.id },
      data: {
        full_name: d.full_name, college: d.college, department: d.department,
        semester: d.semester || null, phone: d.phone || null,
        contact_preferences: d.contact_preferences, bio: d.bio || null,
        ...(profilePicture ? { profile_picture: profilePicture } : {}),
      },
    });
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: "Profile updated successfully." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update profile." };
  }
}

export async function resendVerification() {
  const student = await currentStudent();
  if (!student) redirect("/login");
  const { randomBytes } = await import("node:crypto");
  const token = student.verification_token || randomBytes(24).toString("hex");
  await prisma.users.update({ where: { id: student.id }, data: { verification_token: token } });
  console.info(`[ReUse Campus] Verify ${student.email}: /auth/verify?token=${token}`);
  redirect("/profile?verify=1");
}
