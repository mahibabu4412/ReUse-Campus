import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page, pages, hrefFor,
}: { page: number; pages: number; hrefFor: (page: number) => string }) {
  if (pages <= 1) return null;
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);
  const items: (number | "left" | "right")[] = [];
  if (page > 1) items.push("left");
  for (let i = start; i <= end; i++) items.push(i);
  if (page < pages) items.push("right");

  return (
    <nav className="mt-8 flex flex-wrap justify-center gap-1.5" aria-label="Pagination">
      {items.map((item) =>
        typeof item === "number" ? (
          <Link key={item} href={hrefFor(item)} className={cn(
            "grid size-9 place-items-center rounded-lg border text-sm font-semibold transition-colors hover:bg-accent",
            item === page && "border-primary bg-primary text-primary-foreground hover:bg-primary"
          )}>{item}</Link>
        ) : (
          <Link key={item} href={hrefFor(item === "left" ? page - 1 : page + 1)} className="grid size-9 place-items-center rounded-lg border hover:bg-accent">
            {item === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </Link>
        )
      )}
    </nav>
  );
}
