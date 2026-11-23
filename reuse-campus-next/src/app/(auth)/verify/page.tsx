import { verifyEmailAction } from "@/actions/auth";

export const metadata = { title: "Verify email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  await verifyEmailAction(token);
  return null;
}
