import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next.js 16: Middleware is now called Proxy. The `authorized` callback in
// authConfig performs the role-based route checks (student vs admin areas).
export const { auth: proxy } = NextAuth(authConfig);
export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)"],
};
