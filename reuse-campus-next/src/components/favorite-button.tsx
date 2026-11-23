"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleFavorite } from "@/actions/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  listingId, initialSaved, className,
}: { listingId: number; initialSaved: boolean; className?: string }) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleFavorite(listingId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSaved(Boolean(result.saved));
      toast.success(result.saved ? "Saved to your list" : "Removed from saved items");
    });
  }

  return (
    <button
      type="button" onClick={onClick} disabled={pending}
      aria-label={saved ? "Remove from saved" : "Save item"}
      className={cn(
        "grid size-9 place-items-center rounded-full border bg-background/95 shadow-sm transition-colors hover:text-rose-600 disabled:opacity-60",
        saved ? "text-rose-600" : "text-muted-foreground",
        className
      )}
    >
      <Heart className={cn("size-4", saved && "fill-current")} />
    </button>
  );
}
