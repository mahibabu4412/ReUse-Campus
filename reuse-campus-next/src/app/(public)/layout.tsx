import { auth } from "@/lib/auth";
import { notificationCount } from "@/lib/queries";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FlashToaster } from "@/components/flash-toaster";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user
    ? { name: session.user.name ?? "Student", email: session.user.email ?? "", role: session.user.role }
    : null;
  const unread = user?.role === "student" ? await notificationCount(Number(session!.user.id)) : 0;

  return (
    <>
      <SiteHeader user={user} unread={unread} />
      <FlashToaster />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
