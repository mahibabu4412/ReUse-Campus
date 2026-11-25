"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema, forgotSchema, resetSchema } from "@/lib/validation";

export type ActionState = { error?: string; success?: string; redirectTo?: string };

function flatten(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  const fields = error.flatten().fieldErrors;
  return Object.values(fields).flat()[0] ?? "Please check your input.";
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "student",
  });
  if (!parsed.success) return { error: flatten(parsed.error) };
  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Invalid credentials or suspended account." };
    throw err;
  }
  // Server-side redirect completes the action response so the session cookie
  // is committed before the browser follows the redirect.
  redirect(parsed.data.role === "admin" ? "/admin" : "/dashboard");
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: flatten(parsed.error) };
  const data = parsed.data;

  const existing = await prisma.users.findFirst({
    where: { OR: [{ email: data.email }, { student_id: data.student_id }] },
  });
  if (existing) return { error: "An account with that email or student ID already exists." };

  const token = randomBytes(24).toString("hex");
  await prisma.users.create({
    data: {
      full_name: data.full_name,
      student_id: data.student_id,
      email: data.email,
      password: await bcrypt.hash(data.password, 12),
      college: data.college,
      department: data.department,
      semester: data.semester || null,
      phone: data.phone || null,
      contact_preferences: data.contact_preferences,
      verification_token: token,
      email_verified: false,
      status: "active",
    },
  });

  // Demo mode: log the verification link (no SMTP configured in XAMPP).
  console.info(`[ReUse Campus] Verify ${data.email}: /auth/verify?token=${token}`);

  await signIn("credentials", {
    email: data.email, password: data.password, role: "student", redirect: false,
  });
  redirect("/dashboard?welcome=1");
}

export async function forgotPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: flatten(parsed.error) };
  const user = await prisma.users.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = randomBytes(24).toString("hex");
    await prisma.users.update({ where: { id: user.id }, data: { verification_token: token } });
    console.info(`[ReUse Campus] Reset link for ${user.email}: /reset-password?token=${token}`);
  }
  return { success: "If that account exists, a reset link has been generated. Check the server log in demo mode." };
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: flatten(parsed.error) };
  const user = await prisma.users.findFirst({ where: { verification_token: parsed.data.token } });
  if (!user) return { error: "Invalid or expired reset link." };
  await prisma.users.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(parsed.data.password, 12), verification_token: null },
  });
  redirect("/login?reset=1");
}

export async function verifyEmailAction(token: string) {
  const user = await prisma.users.findFirst({ where: { verification_token: token } });
  if (user) {
    await prisma.users.update({
      where: { id: user.id }, data: { email_verified: true, verification_token: null },
    });
  }
  revalidatePath("/profile");
  redirect("/profile?verified=" + (user ? "1" : "0"));
}

export async function resendVerificationAction() {
  const { currentStudent } = await import("@/lib/auth");
  const student = await currentStudent();
  if (!student) redirect("/login");
  if (!student.verification_token) {
    const token = randomBytes(24).toString("hex");
    await prisma.users.update({ where: { id: student.id }, data: { verification_token: token } });
  }
  redirect("/profile?verify=1");
}
