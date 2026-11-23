import Link from "next/link";
import { Bell, CalendarDays, Gift, Plus, Repeat2, Search, Send, ShieldCheck, Tag, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "How It Works" };

export default function HowItWorksPage() {
  return (
    <>
      <div className="border-b bg-card"><div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6"><p className="text-xs text-muted-foreground">Home / How it works</p><h1 className="mt-2 text-3xl font-bold tracking-tight">How ReUse Campus works</h1><p className="mt-1 text-sm text-muted-foreground">A simple, safe workflow built for busy students.</p></div></div>
      <section className="container mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            [UserPlus, "Create your profile", "Register with your student ID, college and department. Private details stay private."],
            [Search, "List or search", "Post an item with photos and condition — or search and filter the marketplace."],
            [Send, "Send a request", "Choose donation, borrow, exchange or sale. Borrowing includes a return date."],
            [Repeat2, "Exchange & complete", "Owners accept or reject. Mark it complete and build your exchange history."],
          ].map(([Icon, title, text], i) => { const I = Icon as typeof Search; return (
            <div key={title as string} className="rounded-2xl border bg-card p-6 shadow-sm"><span className="mb-4 grid size-10 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span><I className="mb-3 size-5 text-primary" /><h3 className="font-semibold">{title as string}</h3><p className="mt-2 text-sm text-muted-foreground">{text as string}</p></div>
          ); })}
        </div>
      </section>
      <section className="border-y bg-card py-14">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">Four ways to share</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [Gift, "Free donation", "Give items away for free to students who need them."],
              [CalendarDays, "Borrow", "Lend or borrow temporarily with an agreed return date and owner confirmation."],
              [Repeat2, "Exchange", "Swap resources with another student — great for trading gear."],
              [Tag, "Sale", "Set a fair asking price and sell to classmates."],
              [Bell, "Track & get notified", "Every status change triggers a notification for both students."],
              [ShieldCheck, "Stay safe", "Meet on campus and let moderators review reports."],
            ].map(([Icon, title, text]) => { const I = Icon as typeof Gift; return (
              <div key={title as string} className="rounded-2xl border bg-background p-6 shadow-sm"><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><I className="size-5" /></span><h3 className="mt-4 font-semibold">{title as string}</h3><p className="mt-2 text-sm text-muted-foreground">{text as string}</p></div>
            ); })}
          </div>
        </div>
      </section>
      <section className="container mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary p-8 text-primary-foreground md:flex-row md:items-center">
          <div><h2 className="text-2xl font-bold">Ready to get started?</h2><p className="mt-2 text-sm text-primary-foreground/80">Create your free student account and post your first listing in minutes.</p></div>
          <div className="flex gap-3"><Button asChild><Link href="/register">Sign up</Link></Button><Button asChild variant="secondary"><Link href="/explore">Browse items</Link></Button></div>
        </div>
      </section>
    </>
  );
}
