import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/dashboard");
  const pendingReports = await prisma.reports.count({ where: { status: "pending" } });
  return (
    <AppShell role="admin" userName={session.user.name ?? "Administrator"} title="Admin Panel" pendingReports={pendingReports}>
      {children}
    </AppShell>
  );
}
