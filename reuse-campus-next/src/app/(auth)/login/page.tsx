import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { auth } from "@/lib/auth";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect(session.user.role === "admin" ? "/admin" : "/dashboard");
  return (
    <div className="rounded-3xl border bg-card p-7 shadow-lg">
      <h1 className="text-center text-2xl font-bold">Welcome back</h1>
      <p className="mb-7 mt-1 text-center text-sm text-muted-foreground">Log in to your ReUse Campus account.</p>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">New here? <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link></p>
      <p className="mt-2 text-center text-xs"><Link href="/auth/status" className="text-muted-foreground hover:text-primary hover:underline">Login problem? Check session status →</Link></p>
      <div className="my-6 border-t text-center text-xs text-muted-foreground"><span className="relative -top-2 bg-card px-3">or</span></div>
      <Link href="/admin/login" className="block rounded-xl border py-2.5 text-center text-sm font-medium hover:bg-accent">Administrator portal →</Link>
    </div>
  );
}
