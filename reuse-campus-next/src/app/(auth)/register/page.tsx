import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export const metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; name?: string; google?: string }>;
}) {
  const params = await searchParams;
  const defaultEmail = typeof params.email === "string" ? params.email.slice(0, 190) : "";
  const defaultName = typeof params.name === "string" ? params.name.slice(0, 120) : "";
  const fromGoogle = params.google === "1";
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <div className="rounded-3xl border bg-card p-7 shadow-lg">
      <h1 className="text-center text-2xl font-bold">Join ReUse Campus</h1>
      <p className="mb-7 mt-1 text-center text-sm text-muted-foreground">Create your free student account. It only takes a minute.</p>
      {fromGoogle && (
        <p className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
          No account is linked to that Google email yet. Finish signing up below — after that you can log in with Google.
        </p>
      )}
      {googleEnabled && (
        <>
          <GoogleSignInButton label="Sign up with Google" />
          <div className="my-6 border-t text-center text-xs text-muted-foreground"><span className="relative -top-2 bg-card px-3">or create an account with email</span></div>
        </>
      )}
      <RegisterForm defaultEmail={defaultEmail} defaultName={defaultName} />
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link></p>
    </div>
  );
}
