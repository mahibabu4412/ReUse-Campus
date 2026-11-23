import { requireStudent } from "@/lib/auth";
import { getCategories } from "@/lib/queries";
import { ListingForm } from "@/components/listing-form";

export const metadata = { title: "List an item" };

export default async function NewListingPage() {
  await requireStudent();
  const categories = await getCategories();
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Create a new listing</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">Give your item a clear title, honest description and good photos.</p>
      <ListingForm categories={categories} />
    </div>
  );
}
