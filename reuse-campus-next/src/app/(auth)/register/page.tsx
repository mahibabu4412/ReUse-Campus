import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="rounded-3xl border bg-card p-7 shadow-lg">
      <h1 className="text-center text-2xl font-bold">Join ReUse Campus</h1>
      <p className="mb-7 mt-1 text-center text-sm text-muted-foreground">Create your free student account. It only takes a minute.</p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link></p>
    </div>
  );
}
