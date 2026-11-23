import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { manageMessage } from "@/actions/admin";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format";

export const metadata = { title: "Contact messages" };

export default async function AdminMessagesPage() {
  const messages = await prisma.contact_messages.findMany({ orderBy: { created_at: "desc" }, take: 100 });
  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4"><h1 className="text-lg font-semibold">Contact messages</h1><p className="text-xs text-muted-foreground">Messages submitted through the public contact form.</p></div>
      <div className="space-y-3 p-5">
        {messages.length ? messages.map((m) => (
          <div key={m.id} className={`rounded-xl border p-4 ${m.is_read ? "" : "bg-primary/5"}`}>
            <div className="flex flex-wrap items-center gap-2"><Mail className="size-4 text-primary" /><h2 className="font-semibold">{m.subject}</h2>{!m.is_read && <Badge className="bg-amber-100 text-amber-700">New</Badge>}<span className="ml-auto text-xs text-muted-foreground">{m.name} &lt;{m.email}&gt; · {timeAgo(m.created_at)}</span></div>
            <p className="mt-3 whitespace-pre-line rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">{m.message}</p>
            <div className="mt-3 flex gap-2">
              <form action={manageMessage}><input type="hidden" name="id" value={m.id} /><Button type="submit" name="action" value={m.is_read ? "message_unread" : "message_read"} size="sm" variant="outline">{m.is_read ? "Mark unread" : "Mark read"}</Button></form>
              <form action={manageMessage}><input type="hidden" name="id" value={m.id} /><Button type="submit" name="action" value="message_delete" size="sm" variant="ghost" className="text-rose-600">Delete</Button></form>
            </div>
          </div>
        )) : <EmptyState title="No messages yet" description="Contact form submissions will appear here." />}
      </div>
    </div>
  );
}
