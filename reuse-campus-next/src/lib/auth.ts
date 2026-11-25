import NextAuth from "next-auth";
import { redirect } from "next/navigation";
import { randomBytes, randomUUID } from "node:crypto";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password, role } = parsed.data;
        // Emails are stored lowercase; usernames/student IDs keep their case.
        const identifier = email.includes("@") ? email.trim().toLowerCase() : email;

        if (role === "admin") {
          const admin = await prisma.admins.findFirst({
            where: { OR: [{ email: identifier }, { username: email }] },
          });
          if (!admin || !(await bcrypt.compare(password, admin.password))) return null;
          return {
            id: String(admin.id),
            name: admin.full_name,
            email: admin.email,
            role: "admin" as const,
          };
        }

        // Accept either email or student ID in the same field.
        const user = email.includes("@")
          ? await prisma.users.findUnique({ where: { email: identifier } })
          : await prisma.users.findFirst({ where: { student_id: email } });
        if (!user || user.status !== "active") return null;
        if (!(await bcrypt.compare(password, user.password))) return null;
        return {
          id: String(user.id),
          name: user.full_name,
          email: user.email,
          role: "student" as const,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Credentials logins are already verified in authorize().
      if (account?.provider !== "google") return true;

      const email = user.email?.trim().toLowerCase();
      if (!email) return "/login?error=google";

      let student = await prisma.users.findFirst({
        where: { email },
        select: { id: true, status: true, profile_picture: true },
      });

      if (!student) {
        // Google has already verified this email, so create the student account
        // immediately instead of sending them to the registration form. The
        // generated student ID is a temporary placeholder until they complete
        // their profile; a random password keeps credentials auth unusable
        // until they reset it (Google remains their login method).
        const created = await prisma.users.upsert({
          where: { email },
          update: {},
          create: {
            full_name: (user.name?.trim() || email.split("@")[0]).slice(0, 120),
            student_id: `GOOGLE-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`,
            email,
            password: await bcrypt.hash(randomBytes(32).toString("hex"), 12),
            profile_picture: user.image && user.image.length <= 255 ? user.image : null,
            contact_preferences: "email",
            email_verified: true,
            status: "active",
          },
          select: { id: true, status: true, profile_picture: true },
        });
        student = created;
      }

      if (student.status !== "active") return "/login?error=suspended";

      await prisma.users.update({
        where: { id: student.id },
        data: {
          email_verified: true,
          // Keep an uploaded avatar; only fill an empty profile picture.
          // profile_picture is VARCHAR(255), so ignore oversized Google URLs.
          ...(student.profile_picture || !user.image || user.image.length > 255
            ? {}
            : { profile_picture: user.image }),
        },
      });

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const u = user as { role?: "student" | "admin" };
        token.role = u.role ?? "student";
      }
      // OAuth providers supply their own numeric/opaque user ID. Swap it for
      // the local student ID so currentStudent() and role guards keep working.
      if (account?.provider === "google" && token.email) {
        const student = await prisma.users.findFirst({
          where: { email: token.email.toLowerCase() },
          select: { id: true, full_name: true },
        });
        if (student) {
          token.sub = String(student.id);
          token.name = student.full_name;
          token.role = "student";
        }
      }
      return token;
    },
  },
});

/** Current student record (null for admins/guests). */
export async function currentStudent() {
  const session = await auth();
  if (!session?.user || session.user.role !== "student") return null;
  return prisma.users.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      id: true, full_name: true, email: true, student_id: true, college: true,
      department: true, semester: true, phone: true, profile_picture: true,
      contact_preferences: true, bio: true, email_verified: true, status: true,
      created_at: true, verification_token: true,
    },
  });
}

export async function requireStudent() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // A logged-in admin should not be bounced to the student login form.
  if (session.user.role !== "student") redirect("/admin");
  const student = await currentStudent();
  if (!student) redirect("/login");
  return student;
}

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  // A logged-in student should not see the admin login form.
  if (session.user.role !== "admin") redirect("/dashboard");
  return session.user;
}
