import Link from "next/link";
import { BookOpen, HeartHandshake, Leaf, Recycle, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <>
      <div className="border-b bg-card"><div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6"><p className="text-xs text-muted-foreground">Home / About</p><h1 className="mt-2 text-3xl font-bold tracking-tight">About ReUse Campus</h1><p className="mt-1 text-sm text-muted-foreground">Share More. Waste Less. Learn Together.</p></div></div>
      <div className="container mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold">Why we exist</h2>
        <p className="mt-4 leading-8 text-muted-foreground">Educational materials are expensive, yet every semester countless textbooks, calculators, drawing tools and notes are thrown away or left to gather dust. Students pay full price for things another student down the hall is happy to pass on.</p>
        <p className="mt-4 leading-8 text-muted-foreground">ReUse Campus is a student-to-student resource exchange platform built to close that gap. We make it easy to list what you no longer need and find what you do need — whether that means donating, borrowing, exchanging or buying at a fair price.</p>

        <h2 className="mt-12 text-2xl font-bold">Our mission</h2>
        <p className="mt-4 leading-8 text-muted-foreground">To reduce educational expenses and minimise waste by making resource sharing the easiest and most natural choice for every college and polytechnic student.</p>

        <h2 className="mt-12 text-2xl font-bold">Our objectives</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            [HeartHandshake, "Lower costs", "Help students save money by reusing and sharing materials."],
            [Leaf, "Reduce waste", "Keep useful items in circulation and out of landfills."],
            [Users, "Build community", "Connect students across departments and semesters."],
          ].map(([Icon, title, text]) => { const I = Icon as typeof HeartHandshake; return (
            <div key={title as string} className="rounded-2xl border bg-card p-6 shadow-sm"><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><I className="size-5" /></span><h3 className="mt-4 font-semibold">{title as string}</h3><p className="mt-2 text-sm text-muted-foreground">{text as string}</p></div>
          ); })}
        </div>

        <h2 className="mt-12 text-2xl font-bold">Our principles</h2>
        <p className="mt-4 leading-8 text-muted-foreground"><b className="text-foreground">Privacy first.</b> Student ID, contact details and profile information are never exposed publicly. Other students only see the display name you choose.</p>
        <p className="mt-4 leading-8 text-muted-foreground"><b className="text-foreground">Fair and transparent.</b> Every request has a clear status and both parties are notified of changes. Matching suggestions use transparent rules — category, preference, availability and college — and we never claim AI functionality we do not have.</p>
        <p className="mt-4 leading-8 text-muted-foreground"><b className="text-foreground">Student-governed.</b> Moderators review reports and listings so the marketplace stays safe, respectful and useful for everyone.</p>

        <div className="mt-12 flex flex-wrap gap-3"><Button asChild><Link href="/register">Join ReUse Campus</Link></Button><Button asChild variant="outline"><Link href="/how-it-works">How it works</Link></Button></div>
      </div>
    </>
  );
}
