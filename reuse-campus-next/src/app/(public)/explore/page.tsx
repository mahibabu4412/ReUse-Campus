import Link from "next/link";
import { Grid2X2, List, MapPin, Search, SlidersHorizontal, Tag, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listing-card";
import { FavoriteButton } from "@/components/favorite-button";
import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { getCategories, exploreListings, favoriteIds } from "@/lib/queries";
import { auth } from "@/lib/auth";
import { conditionLabel, exchangeLabel, exchangeTone, formatMoney, imageUrl, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ExploreFilters } from "@/lib/queries";

export default async function ExplorePage({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const get = (k: string) => Array.isArray(sp[k]) ? sp[k][0] : sp[k];
  const q = get("q") ?? "";
  const category = Number(get("category")) || 0;
  const condition = (get("condition") ?? "") as ExploreFilters["condition"];
  const type = (get("type") ?? "") as ExploreFilters["type"];
  const sort = (get("sort") ?? "newest") as ExploreFilters["sort"];
  const view = get("view") === "list" ? "list" : "grid";
  const page = Number(get("page")) || 1;

  const session = await auth();
  const uid = session?.user?.role === "student" ? Number(session.user.id) : undefined;
  const [categories, result, favs] = await Promise.all([
    getCategories(),
    exploreListings({ q, category: category || undefined, condition: condition || undefined, type: type || undefined, sort, page }),
    favoriteIds(uid),
  ]);

  const queryFor = (patch: Record<string, string | number>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category) p.set("category", String(category));
    if (condition) p.set("condition", condition);
    if (type) p.set("type", type);
    if (sort && sort !== "newest") p.set("sort", sort);
    p.set("view", view);
    Object.entries(patch).forEach(([k, v]) => v === "" || v === 0 ? p.delete(k) : p.set(k, String(v)));
    return `/explore?${p.toString()}`;
  };

  return (
    <>
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-xs text-muted-foreground">Home / Explore</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Explore marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">Discover resources shared by students across your campus.</p>
        </div>
      </div>

      <div className="container mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[250px_1fr]">
        {/* FILTERS */}
        <aside className="h-fit rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-bold"><SlidersHorizontal className="size-4 text-primary" /> Filters</h2>
          <form action="/explore" method="get" className="space-y-5">
            {view !== "grid" && <input type="hidden" name="view" value={view} />}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="q">Search</label>
              <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input id="q" name="q" defaultValue={q} placeholder="Search resources..." className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</p>
              <select name="category" defaultValue={String(category)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm">
                <option value="0">All categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Exchange type</p>
              <select name="type" defaultValue={type} className="w-full rounded-xl border bg-background px-3 py-2 text-sm">
                <option value="">All types</option>
                <option value="donation">Free donation</option><option value="borrow">Borrow</option>
                <option value="exchange">Exchange</option><option value="sale">For sale</option>
              </select>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Condition</p>
              <select name="condition" defaultValue={condition} className="w-full rounded-xl border bg-background px-3 py-2 text-sm">
                <option value="">Any condition</option><option value="new">Brand new</option>
                <option value="like_new">Like new</option><option value="good">Good</option><option value="fair">Fair</option>
              </select>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort by</p>
              <select name="sort" defaultValue={sort} className="w-full rounded-xl border bg-background px-3 py-2 text-sm">
                <option value="newest">Newest first</option><option value="price_low">Price: low to high</option>
                <option value="price_high">Price: high to low</option>
              </select>
            </div>
            <Button type="submit" size="sm" className="w-full">Apply filters</Button>
            <Button asChild variant="ghost" size="sm" className="w-full"><Link href="/explore">Clear all</Link></Button>
          </form>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <p className="mr-auto text-sm text-muted-foreground">Showing <b className="text-foreground">{result.items.length}</b> of <b className="text-foreground">{result.total}</b> resources{q ? ` for “${q}”` : ""}</p>
            <div className="flex rounded-xl border bg-card p-1">
              <Link href={queryFor({ view: "grid", page: 1 })} className={cn("grid size-8 place-items-center rounded-lg", view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-label="Grid view"><Grid2X2 className="size-4" /></Link>
              <Link href={queryFor({ view: "list", page: 1 })} className={cn("grid size-8 place-items-center rounded-lg", view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-label="List view"><List className="size-4" /></Link>
            </div>
          </div>

          {result.items.length ? (
            view === "grid" ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((l) => <ListingCard key={l.id} listing={l} saved={favs.has(l.id)} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {result.items.map((l) => (
                  <article key={l.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row">
                    <Link href={`/listing/${l.id}`} className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-44">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl(l.listing_images[0]?.filename)} alt={l.title} className="size-full object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex flex-wrap items-center gap-2"><Badge className={exchangeTone(l.exchange_type)}>{exchangeLabel(l.exchange_type)}</Badge><span className="text-xs font-semibold text-primary">{l.categories.name}</span></div>
                      <Link href={`/listing/${l.id}`} className="mt-2 truncate font-semibold hover:text-primary">{l.title}</Link>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Tag className="size-3" />{conditionLabel(l.item_condition)}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{l.pickup_location || "Campus"}</span>
                        <span className="inline-flex items-center gap-1"><Clock3 className="size-3" />{timeAgo(l.created_at)}</span>
                      </div>
                      <div className="mt-auto flex items-center gap-3 pt-3">
                        <span className="text-lg font-bold text-primary">{formatMoney(l.price, l.exchange_type)}</span>
                        <div className="ml-auto flex gap-2"><FavoriteButton listingId={l.id} initialSaved={favs.has(l.id)} /><Button asChild size="sm"><Link href={`/listing/${l.id}`}>View</Link></Button></div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : (
            <EmptyState title="No resources found" description="Try adjusting your search or filters — new items are added every day." actionLabel="Browse all resources" actionHref="/explore" />
          )}
          <Pagination page={result.page} pages={result.pages} hrefFor={(p) => queryFor({ page: p })} />
        </div>
      </div>
    </>
  );
}
