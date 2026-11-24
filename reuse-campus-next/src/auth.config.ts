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
  },
} satisfies NextAuthConfig;
