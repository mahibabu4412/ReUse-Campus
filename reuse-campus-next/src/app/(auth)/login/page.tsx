import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { auth } from "@/lib/auth";

export const metadata = { title: "Log in" };

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "Google sign-in was cancelled or access was denied.",
  OAuthCallback: "Google sign-in failed. Please try again.",
  OAuthSignin: "Could not start Google sign-in. Please try again.",
  OAuthAccountNotLinked: "This email is already registered. Log in with your password instead.",
  Configuration: "Google sign-in is not configured correctly. Please use email and password.",
  suspended: "This account is suspended. Please contact support.",
  google: "Google sign-in failed. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect(session.user.role === "admin" ? "/admin" : "/dashboard");

  const params = await searchParams;
  const error = typeof params.error === "string" ? ERROR_MESSAGES[params.error] : undefined;
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <div className="rounded-3xl border bg-card p-7 shadow-lg">
      <h1 className="text-center text-2xl font-bold">Welcome back</h1>
      <p className="mb-7 mt-1 text-center text-sm text-muted-foreground">Log in to your ReUse Campus account.</p>
      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {googleEnabled && (
        <>
          <GoogleSignInButton />
          <div className="my-6 border-t text-center text-xs text-muted-foreground"><span className="relative -top-2 bg-card px-3">or continue with email</span></div>
        </>
      )}
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">New here? <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link></p>
      <div className="my-6 border-t text-center text-xs text-muted-foreground"><span className="relative -top-2 bg-card px-3">or</span></div>
      <Link href="/admin/login" className="block rounded-xl border py-2.5 text-center text-sm font-medium hover:bg-accent">Administrator portal →</Link>
    </div>
  );
}
