import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js 16 Proxy (formerly middleware).
 * Optimistic route protection: students go to /login, admin areas go to
 * /admin/login. Authorization is enforced again in layouts and Server Actions.
 */
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const role = token?.role as "student" | "admin" | undefined;

  const isAdminLogin = path === "/admin/login";
  const isAdminArea = path === "/admin" || path.startsWith("/admin/");
  const studentPrefixes = ["/dashboard", "/profile", "/listings", "/requests"];
  const isStudentArea = studentPrefixes.some((p) => path === p || path.startsWith(`${p}/`));

  if (isAdminArea && !isAdminLogin && role !== "admin") {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(url);
  }

  if (isStudentArea && role !== "student" && role !== "admin") {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)"],
};
