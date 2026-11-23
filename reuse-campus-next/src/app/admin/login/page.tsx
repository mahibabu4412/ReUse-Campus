import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth-forms";
import { auth } from "@/lib/auth";

export const metadata = { title: "Admin login" };

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.role === "admin") redirect("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-lg">
        <div className="mb-6 flex justify-center"><span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><ShieldCheck className="size-6" /></span></div>
        <h1 className="text-center text-2xl font-bold">Admin portal</h1>
        <p className="mb-7 mt-1 text-center text-sm text-muted-foreground">Restricted area — authorised administrators only.</p>
        <LoginForm fixedRole="admin" />
        <p className="mt-6 text-center text-sm"><Link href="/" className="font-semibold text-primary hover:underline">← Back to website</Link></p>
      </div>
    </div>
  );
}
