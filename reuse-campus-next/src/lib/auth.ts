import NextAuth from "next-auth";
import { redirect } from "next/navigation";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
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

        if (role === "admin") {
          const admin = await prisma.admins.findFirst({
            where: { OR: [{ email }, { username: email }] },
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
          ? await prisma.users.findUnique({ where: { email } })
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
  const student = await currentStudent();
  if (!student) redirect("/login");
  return student;
}

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/admin/login");
  return session.user;
}
