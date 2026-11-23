"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { saveCategory, deleteCategory } from "@/actions/admin";
import { iconForCategory } from "@/lib/category-icons";

type Category = {
  id: number; name: string; slug: string; description: string | null;
  icon: string | null; status: string; listing_count?: number;
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null);
  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Items</th><th className="p-3">Status</th><th className="p-3" /></tr></thead>
          <tbody className="divide-y">
            {categories.map((c) => {
              const Icon = iconForCategory(c.icon);
              return <tr key={c.id} className="hover:bg-muted/40">
                <td className="p-3"><span className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span><b>{c.name}</b></span></td>
                <td className="p-3 text-xs text-muted-foreground">{c.slug}</td>
                <td className="p-3">{c.listing_count ?? 0}</td>
                <td className="p-3 text-xs capitalize text-muted-foreground">{c.status}</td>
                <td className="p-3"><div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditing(c)}><Pencil className="size-4" /></Button>
                  <form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><Button type="submit" variant="ghost" size="icon" className="size-8 text-rose-600"><Trash2 className="size-4" /></Button></form>
                </div></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit category</DialogTitle></DialogHeader>
          {editing && <form action={async (fd) => { await saveCategory(fd); setEditing(null); }} className="space-y-4">
            <input type="hidden" name="id" value={editing.id} />
            <div><Label htmlFor="e-name">Name</Label><Input id="e-name" name="name" defaultValue={editing.name} className="mt-1.5" required /></div>
            <div><Label htmlFor="e-slug">Slug</Label><Input id="e-slug" name="slug" defaultValue={editing.slug} className="mt-1.5" required /></div>
            <div><Label htmlFor="e-desc">Description</Label><Input id="e-desc" name="description" defaultValue={editing.description ?? ""} className="mt-1.5" /></div>
            <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="e-icon">Icon</Label><Input id="e-icon" name="icon" defaultValue={editing.icon ?? "layers"} className="mt-1.5" /></div>
              <div><Label htmlFor="e-status">Status</Label><select id="e-status" name="status" defaultValue={editing.status} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div>
            <Button type="submit">Save changes</Button>
          </form>}
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border p-5">
        <h3 className="mb-4 text-sm font-semibold">Add category</h3>
        <form action={saveCategory} className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="name">Name</Label><Input id="name" name="name" required className="mt-1.5" /></div>
          <div><Label htmlFor="slug">Slug</Label><Input id="slug" name="slug" required className="mt-1.5" placeholder="robotics-kits" /></div>
          <div><Label htmlFor="description">Description</Label><Input id="description" name="description" className="mt-1.5" /></div>
          <div><Label htmlFor="icon">Icon name</Label><Input id="icon" name="icon" defaultValue="layers" className="mt-1.5" /></div>
          <Button type="submit" className="sm:col-span-2">Add category</Button>
        </form>
      </div>
    </div>
  );
}
