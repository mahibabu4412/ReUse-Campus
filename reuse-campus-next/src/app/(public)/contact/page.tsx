import { Clock, Mail, MapPin, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { auth } from "@/lib/auth";

export const metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const session = await auth();
  const user = session?.user?.role === "student" ? session.user : null;
  const student = user ? await (await import("@/lib/prisma")).prisma.users.findUnique({ where: { id: Number(user.id) }, select: { full_name: true, email: true } }) : null;

  return (
    <>
      <div className="border-b bg-card"><div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6"><p className="text-xs text-muted-foreground">Home / Contact</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Contact us</h1><p className="mt-1 text-sm text-muted-foreground">Questions, feedback or need a hand? We&apos;re here to help.</p></div></div>
      <div className="container mx-auto grid max-w-6xl gap-7 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">Send us a message</h2>
          <ContactForm defaultName={student?.full_name ?? ""} defaultEmail={student?.email ?? ""} />
        </div>
        <div className="space-y-5">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-semibold">Other ways to reach us</h2>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-primary" /><div><b className="text-foreground">Email</b><br />hello@reusecampus.edu<br />support@reusecampus.edu</div></li>
              <li className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" /><div><b className="text-foreground">Campus office</b><br />Rajshahi Polytechnic Institute, Rajshahi</div></li>
              <li className="flex gap-3"><Clock className="mt-0.5 size-4 shrink-0 text-primary" /><div><b className="text-foreground">Support hours</b><br />Saturday – Thursday, 9am – 6pm</div></li>
              <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /><div><b className="text-foreground">Safety</b><br />Use the Report button on any listing to flag inappropriate content.</div></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
