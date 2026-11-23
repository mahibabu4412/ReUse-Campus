import { signOut } from "@/lib/auth";

export async function GET(request: Request) {
  await signOut({ redirect: false });
  const url = new URL("/", request.url);
  return Response.redirect(url, 303);
}
