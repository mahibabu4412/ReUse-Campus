import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function getCategories(activeOnly = true) {
  return prisma.categories.findMany({
    where: activeOnly ? { status: "active" } : undefined,
    orderBy: { name: "asc" },
  });
}

export type ListingWithRelations = Prisma.listingsGetPayload<{
  include: {
    categories: true;
    users: { select: { id: true, full_name: true, profile_picture: true } };
    listing_images: { orderBy: [{ is_primary: "desc" }, { id: "asc" }] };
  };
}>;

export async function getListingById(id: number) {
  return prisma.listings.findUnique({
    where: { id },
    include: {
      categories: true,
      users: { select: { id: true, full_name: true, college: true, department: true, profile_picture: true } },
      listing_images: { orderBy: [{ is_primary: "desc" }, { id: "asc" }] },
    },
  });
}

export async function incrementViews(id: number) {
  await prisma.listings.update({ where: { id }, data: { views: { increment: 1 } } });
}

export async function isFavorite(userId: number | undefined, listingId: number) {
  if (!userId) return false;
  const row = await prisma.favorites.findUnique({
    where: { user_id_listing_id: { user_id: userId, listing_id: listingId } },
  });
  return Boolean(row);
}

export async function favoriteIds(userId: number | undefined): Promise<Set<number>> {
  if (!userId) return new Set();
  const rows = await prisma.favorites.findMany({
    where: { user_id: userId }, select: { listing_id: true },
  });
  return new Set(rows.map((r) => r.listing_id));
}

export async function notificationCount(userId: number | undefined) {
  if (!userId) return 0;
  return prisma.notifications.count({ where: { user_id: userId, is_read: false } });
}

export async function addNotification(
  userId: number,
  title: string,
  message: string,
  type: "request" | "system" | "exchange" | "report" | "account" = "system",
  link: string | null = null
) {
  await prisma.notifications.create({
    data: { user_id: userId, title, message: message.slice(0, 500), type, link },
  });
}

export async function platformStats() {
  const [students, listings, exchanges, categories] = await Promise.all([
    prisma.users.count({ where: { status: "active" } }),
    prisma.listings.count({ where: { status: "active" } }),
    prisma.exchange_history.count(),
    prisma.categories.count({ where: { status: "active" } }),
  ]);
  return { students, listings, exchanges, categories };
}

export async function homeSection(
  where: Prisma.listingsWhereInput,
  orderBy: Prisma.listingsOrderByWithRelationInput,
  take: number
) {
  return prisma.listings.findMany({
    where, orderBy, take,
    include: {
      categories: true,
      users: { select: { id: true, full_name: true, profile_picture: true } },
      listing_images: { orderBy: [{ is_primary: "desc" }, { id: "asc" }], take: 1 },
    },
  });
}

export type ExploreFilters = {
  q?: string;
  category?: number;
  condition?: "new" | "like_new" | "good" | "fair" | "";
  type?: "donation" | "borrow" | "exchange" | "sale" | "";
  sort?: "newest" | "relevance" | "price_low" | "price_high";
  page?: number;
  perPage?: number;
};

export async function exploreListings(filters: ExploreFilters) {
  const {
    q = "", category, condition, type,
    sort = "newest", page = 1, perPage = 12,
  } = filters;

  const where: Prisma.listingsWhereInput = { status: "active" };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { categories: { name: { contains: q } } },
    ];
  }
  if (category) where.category_id = category;
  if (condition) where.item_condition = condition;
  if (type) where.exchange_type = type;

  const orderBy: Prisma.listingsOrderByWithRelationInput[] =
    sort === "price_low" ? [{ price: "asc" }]
    : sort === "price_high" ? [{ price: "desc" }]
    : [{ created_at: "desc" }];

  const [total, items] = await Promise.all([
    prisma.listings.count({ where }),
    prisma.listings.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        categories: true,
        users: { select: { id: true, full_name: true, profile_picture: true } },
        listing_images: { orderBy: [{ is_primary: "desc" }, { id: "asc" }], take: 1 },
      },
    }),
  ]);

  return { total, items, pages: Math.max(1, Math.ceil(total / perPage)), page };
}
