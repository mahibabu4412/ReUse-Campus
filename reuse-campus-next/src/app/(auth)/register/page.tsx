import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <div className="rounded-3xl border bg-card p-7 shadow-lg">
      <h1 className="text-center text-2xl font-bold">Join ReUse Campus</h1>
      <p className="mb-7 mt-1 text-center text-sm text-muted-foreground">Create your free student account. It only takes a minute.</p>
      {googleEnabled && (
        <>
          <GoogleSignInButton label="Sign up with Google" />
          <div className="my-6 border-t text-center text-xs text-muted-foreground"><span className="relative -top-2 bg-card px-3">or create an account with email</span></div>
        </>
      )}
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link></p>
    </div>
  );
}
