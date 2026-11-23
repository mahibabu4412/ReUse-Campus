"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createListing, updateListing, type ListingActionState } from "@/actions/listings";

type Category = { id: number; name: string };
type Initial = {
  title?: string; description?: string; category_id?: number; item_condition?: string;
  exchange_type?: string; price?: number | string; availability?: string; pickup_location?: string | null;
};

const initial: ListingActionState = {};

export function ListingForm({ categories, listingId, initialValues }: {
  categories: Category[]; listingId?: number; initialValues?: Initial;
}) {
  const action = listingId ? updateListing.bind(null, listingId) : createListing;
  const [state, formAction, pending] = useActionState<ListingActionState, FormData>(action, initial);
  const [previews, setPreviews] = useState<string[]>([]);
  const [type, setType] = useState(initialValues?.exchange_type ?? "donation");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <div><Label htmlFor="title">Item name</Label><Input id="title" name="title" required minLength={5} maxLength={180} defaultValue={initialValues?.title} className="mt-1.5" placeholder="e.g. Engineering Mathematics textbook" /></div>
      <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" required minLength={20} maxLength={5000} defaultValue={initialValues?.description} className="mt-1.5 min-h-32" placeholder="Describe the item, its condition and any important details..." /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="category_id">Category</Label>
          <select id="category_id" name="category_id" defaultValue={initialValues?.category_id} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" required>
            <option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><Label htmlFor="item_condition">Condition</Label>
          <select id="item_condition" name="item_condition" defaultValue={initialValues?.item_condition ?? "good"} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm">
            <option value="new">Brand new</option><option value="like_new">Like new</option><option value="good">Good</option><option value="fair">Fair</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="exchange_type">Exchange type</Label>
          <select id="exchange_type" name="exchange_type" value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm">
            <option value="donation">Free donation</option><option value="borrow">Borrow</option><option value="exchange">Exchange</option><option value="sale">Sale</option>
          </select>
        </div>
        <div><Label htmlFor="price">Asking price (BDT)</Label><Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={initialValues?.price ?? 0} disabled={type !== "sale"} className="mt-1.5 disabled:opacity-50" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="availability">Availability</Label>
          <select id="availability" name="availability" defaultValue={initialValues?.availability ?? "available"} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm">
            <option value="available">Available</option><option value="reserved">Reserved</option>
          </select>
        </div>
        <div><Label htmlFor="pickup_location">Pickup location</Label><Input id="pickup_location" name="pickup_location" maxLength={190} defaultValue={initialValues?.pickup_location ?? ""} className="mt-1.5" placeholder="e.g. Library Gate, Main Campus" /></div>
      </div>
      <div>
        <Label htmlFor="images">{listingId ? "Add more photos" : "Photos"} <span className="font-normal text-muted-foreground">(up to 5)</span></Label>
        <label htmlFor="images" className="mt-1.5 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5">
          <Camera className="size-6 text-primary" /> Click to choose images<br /><span className="text-[11px]">JPG, PNG, GIF or WEBP · max 5 MB each</span>
        </label>
        <Input id="images" name="images" type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
          const files = Array.from(e.target.files ?? []).slice(0, 5);
          setPreviews(files.map((f) => URL.createObjectURL(f)));
        }} />
        {previews.length > 0 && <div className="mt-3 flex gap-2">{previews.map((src, i) => (
          <div key={i} className="relative size-20 overflow-hidden rounded-xl border"><Image src={src} alt="preview" fill unoptimized className="object-cover" /><button type="button" onClick={() => setPreviews(previews.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white"><X className="size-3" /></button></div>
        ))}</div>}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving..." : listingId ? "Save changes" : "Publish listing"}</Button>
      </div>
    </form>
  );
}
