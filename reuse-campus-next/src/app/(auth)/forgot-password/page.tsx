import Link from "next/link";
import { ForgotForm } from "@/components/auth-forms";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-3xl border bg-card p-7 shadow-lg">
      <h1 className="text-center text-2xl font-bold">Reset your password</h1>
      <p className="mb-7 mt-1 text-center text-sm text-muted-foreground">Enter your email and we&apos;ll create a secure reset link.</p>
      <ForgotForm />
      <p className="mt-6 text-center text-sm"><Link href="/login" className="font-semibold text-primary hover:underline">← Back to login</Link></p>
    </div>
  );
}
