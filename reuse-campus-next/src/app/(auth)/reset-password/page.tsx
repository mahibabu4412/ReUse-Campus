import { ResetForm } from "@/components/auth-forms";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <div className="rounded-3xl border bg-card p-7 shadow-lg">
      <h1 className="text-center text-2xl font-bold">Choose a new password</h1>
      <p className="mb-7 mt-1 text-center text-sm text-muted-foreground">Pick a strong password you haven&apos;t used before.</p>
      <ResetForm token={token} />
    </div>
  );
}
