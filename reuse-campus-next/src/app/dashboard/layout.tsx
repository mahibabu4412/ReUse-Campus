import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { notificationCount } from "@/lib/queries";
import { AppShell } from "@/components/app-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "student") redirect("/admin");
  const unread = await notificationCount(Number(session.user.id));
  return (
    <AppShell role="student" userName={session.user.name ?? "Student"} title="Student Dashboard" unread={unread}>
      {children}
    </AppShell>
  );
}
