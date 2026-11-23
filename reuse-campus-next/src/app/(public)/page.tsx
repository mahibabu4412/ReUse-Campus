import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, CheckCircle2, Cpu, FlaskConical, Gift, Layers, PenTool, Repeat2, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listing-card";
import { EmptyState } from "@/components/empty-state";
import { getCategories, homeSection, platformStats, favoriteIds } from "@/lib/queries";
import { auth } from "@/lib/auth";
import { iconForCategory } from "@/lib/category-icons";

export default async function HomePage() {
  const session = await auth();
  const uid = session?.user?.role === "student" ? Number(session.user.id) : undefined;
  const [categories, featured, recent, freebies, stats, favs] = await Promise.all([
    getCategories(),
    homeSection({ status: "active", availability: "available" }, { views: "desc" }, 8),
    homeSection({ status: "active", availability: "available" }, { created_at: "desc" }, 4),
    homeSection({ status: "active", exchange_type: "donation" }, { created_at: "desc" }, 4),
    platformStats(),
    favoriteIds(uid),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge className="gap-1.5 bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="size-3.5" /> The smarter way to share resources</Badge>
            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Good resources deserve <span className="text-primary">a second life.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Buy, sell, borrow, donate or exchange textbooks, notes, tools and tech with students on your campus. Spend less, waste less, learn together.
            </p>
            <form action="/explore" className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border bg-card p-2 shadow-sm sm:flex-row">
              <div className="flex flex-1 items-center gap-2 px-3 text-muted-foreground"><Search className="size-5" />
                <input name="q" type="search" placeholder="Search textbooks, calculators, notes..." className="w-full bg-transparent py-2.5 text-sm outline-none" aria-label="Search resources" />
              </div>
              <Button type="submit">Search</Button>
            </form>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-primary" /> Verified students only</span>
              <span className="inline-flex items-center gap-1.5"><Repeat2 className="size-4 text-primary" /> 4 ways to exchange</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4 rounded-3xl border bg-card p-5 shadow-xl">
              {["/images/ph-book-math.svg", "/images/ph-calculator.svg", "/images/ph-drawing.svg", "/images/ph-notes.svg"].map((src, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={src} src={src} alt="" className={`aspect-[5/4] w-full rounded-2xl object-cover ${i % 2 ? "translate-y-3" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHead eyebrow="Browse by category" title="Find exactly what you need" href="/explore" linkText="View all resources" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => {
            const Icon = iconForCategory(c.icon);
            return (
              <Link key={c.id} href={`/explore?category=${c.id}`} className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
                <span className="min-w-0"><span className="block truncate text-sm font-semibold">{c.name}</span><span className="block truncate text-xs text-muted-foreground">{c.description}</span></span>
              </Link>
            );
          })}
        </div>
      </section>

      <ListingSection title="Featured listings" eyebrow="Trending on campus" description="Popular resources students are looking at right now." items={featured} favs={favs} href="/explore" linkText="Explore marketplace" />

      {/* STATS */}
      <section className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-6 rounded-3xl bg-green-950 px-6 py-10 text-center text-white md:grid-cols-4">
          {[
            { icon: Users, value: `${stats.students}+`, label: "Active students" },
            { icon: BookOpen, value: stats.listings, label: "Live listings" },
            { icon: Repeat2, value: stats.exchanges, label: "Exchanges completed" },
            { icon: Layers, value: stats.categories, label: "Resource categories" },
          ].map((s) => <div key={s.label}><s.icon className="mx-auto mb-3 size-7 text-emerald-300" /><div className="text-3xl font-bold">{s.value}</div><div className="text-sm text-emerald-200">{s.label}</div></div>)}
        </div>
      </section>

      <ListingSection title="Recently added" eyebrow="Fresh on campus" description="The newest resources shared by students like you." items={recent} favs={favs} href="/explore?sort=newest" linkText="See all new items" />

      <div className="border-y bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <ListingSection title="Free donations" eyebrow="Give a little, help a lot" description="Resources students are giving away for free." items={freebies} favs={favs} href="/explore?type=donation" linkText="Browse donations" />
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead eyebrow="Simple by design" title="How ReUse Campus works" centered />
        <div className="grid gap-5 md:grid-cols-4">
          {[
            ["Create your profile", "Sign up with your student details. Private information stays private."],
            ["List or search", "Upload photos of items you no longer need, or search the marketplace."],
            ["Send a request", "Agree on terms with the owner and track your request status."],
            ["Exchange & reuse", "Meet on campus, complete the exchange and keep resources circulating."],
          ].map(([title, text], i) => (
            <div key={title} className="rounded-2xl border bg-card p-6 shadow-sm">
              <span className="mb-4 grid size-10 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
              <h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <SectionHead eyebrow="From the community" title="What students say" />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["SI", "Sadia Islam", "Civil Engineering, 3rd semester", "I found all my first-year textbooks for a fraction of the price. The sellers were fellow students from my own campus."],
            ["TH", "Tanvir Hasan", "Mechanical Engineering, 6th semester", "I donated my old drawing instruments and they went to a junior who really needed them. Feels great to give things a second life."],
            ["NJ", "Nusrat Jahan", "Computer Science, 5th semester", "Borrowing a calculator for exams instead of buying one saved me money. Request tracking kept everything clear."],
          ].map(([initials, name, meta, quote]) => (
            <div key={name} className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex gap-0.5 text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Sparkles key={i} className="size-3.5 fill-current" />)}</div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">“{quote}”</p>
              <div className="mt-5 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials}</span><div><p className="text-xs font-semibold">{name}</p><p className="text-[11px] text-muted-foreground">{meta}</p></div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary p-8 text-primary-foreground md:flex-row md:items-center">
          <div><h2 className="text-2xl font-bold">Ready to share more and waste less?</h2><p className="mt-2 text-sm text-primary-foreground/80">Join your campus community of smart, resourceful students today.</p></div>
          <Button asChild variant="secondary" size="lg"><Link href="/register">Create free account <ArrowRight className="size-4" /></Link></Button>
        </div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, description, href, linkText, centered }: {
  eyebrow: string; title: string; description?: string; href?: string; linkText?: string; centered?: boolean;
}) {
  return (
    <div className={`mb-7 flex flex-wrap items-end justify-between gap-4 ${centered ? "flex-col text-center" : ""}`}>
      <div><p className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p><h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>{description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}</div>
      {href && <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5">{linkText} <ArrowRight className="size-4" /></Link>}
    </div>
  );
}

function ListingSection({ eyebrow, title, description, items, favs, href, linkText }: {
  eyebrow: string; title: string; description: string;
  items: Awaited<ReturnType<typeof homeSection>>; favs: Set<number>; href: string; linkText: string;
}) {
  return (
    <section className="py-6">
      <SectionHead eyebrow={eyebrow} title={title} description={description} href={href} linkText={linkText} />
      {items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{items.map((l) => <ListingCard key={l.id} listing={l} saved={favs.has(l.id)} />)}</div>
      ) : (
        <EmptyState title="No listings yet" description="Be the first to list a resource on your campus." actionLabel="List an item" actionHref="/listings/new" />
      )}
    </section>
  );
}
