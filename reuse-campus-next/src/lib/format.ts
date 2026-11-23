export function formatMoney(amount: unknown, exchangeType?: string): string {
  if (exchangeType === "donation") return "Free";
  const n = Number(amount ?? 0);
  return `৳${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function timeAgo(value: Date | string | null | undefined): string {
  if (!value) return "";
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return "";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  const units: [number, string][] = [
    [31536000, "year"], [2592000, "month"], [604800, "week"],
    [86400, "day"], [3600, "hour"], [60, "minute"],
  ];
  for (const [sec, label] of units) {
    if (diff >= sec) {
      const n = Math.floor(diff / sec);
      return `${n} ${label}${n > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

export const CONDITION_LABELS: Record<string, string> = {
  new: "Brand New", like_new: "Like New", good: "Good", fair: "Fair",
};
export const EXCHANGE_LABELS: Record<string, string> = {
  donation: "Free Donation", borrow: "Borrow", exchange: "Exchange", sale: "For Sale",
};
export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", accepted: "Accepted", rejected: "Rejected",
  completed: "Completed", cancelled: "Cancelled", active: "Active",
  removed: "Removed", sold: "Sold", reserved: "Reserved",
  reviewed: "Reviewed", resolved: "Resolved", dismissed: "Dismissed",
  inactive: "Inactive", suspended: "Suspended",
};

export function conditionLabel(v: string) { return CONDITION_LABELS[v] ?? v; }
export function exchangeLabel(v: string) { return EXCHANGE_LABELS[v] ?? v; }

export function statusTone(status: string): string {
  if (["accepted", "completed", "active", "available", "resolved", "reviewed"].includes(status))
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  if (["rejected", "removed", "suspended", "dismissed"].includes(status))
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
  if (["pending", "reserved", "sold"].includes(status))
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  return "bg-muted text-muted-foreground";
}

export function exchangeTone(type: string): string {
  return {
    donation: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    borrow: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    exchange: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    sale: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  }[type] ?? "bg-muted text-muted-foreground";
}

export function imageUrl(filename?: string | null): string {
  if (!filename) return "/images/placeholder.svg";
  if (/^https?:\/\//i.test(filename)) return filename;
  if (filename.startsWith("uploads/")) return `/${filename}`;
  if (filename.startsWith("images/")) return `/${filename}`;
  return `/uploads/listings/${filename}`;
}

export function initials(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}

export function truncate(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
