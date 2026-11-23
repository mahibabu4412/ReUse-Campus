import { CategoryManager } from "@/components/category-manager";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Category management" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.categories.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { listings: true } } },
  });
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h1 className="mb-1 text-lg font-semibold">Categories <span className="text-sm font-normal text-muted-foreground">({categories.length})</span></h1>
      <p className="mb-5 text-xs text-muted-foreground">Organise how resources are discovered. Categories in use can only be set inactive.</p>
      <CategoryManager categories={categories.map((c) => ({ ...c, listing_count: c._count.listings }))} />
    </div>
  );
}
