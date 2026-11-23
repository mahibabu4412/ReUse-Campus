import { prisma } from "@/lib/prisma";

export type MatchResult = {
  id: number;
  title: string;
  price: number;
  exchange_type: string;
  image: string | null;
  match_score: number;
  match_reasons: string[];
};

/**
 * Transparent, rule-based recommendations. No AI is used or claimed.
 * +40 same category, +25 same exchange type, +20 same college, +8 title keyword.
 */
export async function matchListings(
  target: { id: number; category_id: number; exchange_type: string; title: string; owner_college?: string | null },
  limit = 4
): Promise<MatchResult[]> {
  const candidates = await prisma.listings.findMany({
    where: {
      status: "active",
      availability: "available",
      id: { not: target.id },
    },
    select: {
      id: true, title: true, price: true, exchange_type: true, category_id: true,
      users: { select: { college: true } },
      listing_images: { orderBy: [{ is_primary: "desc" }, { id: "asc" }], take: 1 },
    },
  });

  const keywords = target.title.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const scored: MatchResult[] = candidates.map((c) => {
    let score = 0;
    const reasons: string[] = [];
    if (c.category_id === target.category_id) { score += 40; reasons.push("Same category"); }
    if (c.exchange_type === target.exchange_type) { score += 25; reasons.push("Same exchange type"); }
    if (target.owner_college && c.users.college === target.owner_college) {
      score += 20; reasons.push("Same college");
    }
    const title = c.title.toLowerCase();
    if (keywords.some((kw) => title.includes(kw))) { score += 8; reasons.push("Title keyword match"); }
    if (!reasons.length) reasons.push("Available now");
    return {
      id: c.id,
      title: c.title,
      price: Number(c.price),
      exchange_type: c.exchange_type,
      image: c.listing_images[0]?.filename ?? null,
      match_score: Math.min(100, score),
      match_reasons: reasons.slice(0, 3),
    };
  });

  scored.sort((a, b) => b.match_score - a.match_score);
  return scored.slice(0, limit);
}
