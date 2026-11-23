import Link from "next/link";
import { Mail, MapPin, Clock, ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="container mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 font-bold">
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><img src="/images/logo.svg" alt="" className="size-5" /></span>
              ReUse Campus
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Share More. Waste Less. Learn Together. A student-powered marketplace for textbooks, notes, tools and tech.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link className="hover:text-primary" href="/explore">All resources</Link></li>
              <li><Link className="hover:text-primary" href="/explore?type=donation">Free donations</Link></li>
              <li><Link className="hover:text-primary" href="/explore?type=borrow">Borrow items</Link></li>
              <li><Link className="hover:text-primary" href="/explore?type=exchange">Exchange</Link></li>
              <li><Link className="hover:text-primary" href="/explore?type=sale">Buy &amp; sell</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link className="hover:text-primary" href="/about">About us</Link></li>
              <li><Link className="hover:text-primary" href="/how-it-works">How it works</Link></li>
              <li><Link className="hover:text-primary" href="/contact">Contact</Link></li>
              <li><Link className="hover:text-primary" href="/register">Join the community</Link></li>
              <li><Link className="hover:text-primary" href="/admin/login">Admin portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider">Get in touch</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> Rajshahi Polytechnic Institute, Rajshahi</li>
              <li className="flex gap-2"><Mail className="mt-0.5 size-4 shrink-0 text-primary" /> hello@reusecampus.edu</li>
              <li className="flex gap-2"><Clock className="mt-0.5 size-4 shrink-0 text-primary" /> Sat–Thu, 9am–6pm</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} ReUse Campus. Built for students, by students.</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="size-4" /> Secure · Private · Student-only</span>
        </div>
      </div>
    </footer>
  );
}
