import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markNotificationsRead } from "@/actions/requests";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const student = await requireStudent();
  const [rows, unread] = await Promise.all([
    prisma.notifications.findMany({ where: { user_id: student.id }, orderBy: { created_at: "desc" }, take: 100 }),
    prisma.notifications.count({ where: { user_id: student.id, is_read: false } }),
  ]);

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div><h1 className="text-lg font-semibold">Notifications {unread > 0 && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{unread} unread</span>}</h1><p className="text-xs text-muted-foreground">Updates about your requests, listings and exchanges.</p></div>
        {unread > 0 && <form action={markNotificationsRead}><Button type="submit" variant="outline" size="sm"><CheckCheck className="size-4" /> Mark all read</Button></form>}
      </div>
      <div>
        {rows.length ? rows.map((n) => (
          <div key={n.id} className={cn("flex gap-3 border-b px-5 py-4 last:border-0", !n.is_read && "bg-primary/5")}>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Bell className="size-4" /></span>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{n.title}</p><p className="text-sm text-muted-foreground">{n.message}</p><p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</p>{n.link && <Link href={n.link} className="mt-1 inline-block text-xs font-semibold text-primary hover:underline">Open →</Link>}</div>
            {!n.is_read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />}
          </div>
        )) : <div className="p-5"><EmptyState title="You're all caught up" description="Notifications about your activity will show up here." /></div>}
      </div>
    </div>
  );
}
