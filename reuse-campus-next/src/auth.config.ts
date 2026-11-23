import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe base config. Prisma/Credentials are added in src/lib/auth.ts.
 * Middleware imports this file only.
 */
export const authConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { role?: "student" | "admin" };
        token.role = u.role ?? "student";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "student" | "admin") ?? "student";
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      const studentArea = ["/dashboard", "/profile", "/listings", "/requests"];
      const isStudentArea = studentArea.some(
        (p) => path === p || path.startsWith(`${p}/`)
      );
      const isAdminArea = path === "/admin" || path.startsWith("/admin/");
      const isAdminLogin = path === "/admin/login";

      if (isAdminLogin) return true;
      if (isAdminArea) return role === "admin";
      if (isStudentArea) return role === "student" || role === "admin";
      return true;
    },
  },
} satisfies NextAuthConfig;
