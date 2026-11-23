# ReUse Campus — PHP → Next.js Migration Plan

## 1. Existing project analysis (completed)

### 1.1 Structure (50 PHP files)
| Folder | Purpose |
|---|---|
| `config/` | `config.php` (session, base URL), `database.php` (PDO singleton) |
| `includes/` | `header/footer/navbar/sidebar`, `auth.php` (session RBAC), `functions.php` (helpers, matching engine, stats), `icons.php`, `components.php` |
| Root pages | `index.php`, `explore.php`, `listing.php`, `how-it-works.php`, `about.php`, `contact.php` |
| `auth/` | register, login, logout, forgot, reset, verify |
| `dashboard/` | index, listings, requests, incoming, saved, history, notifications |
| `listings/` | create, edit (multi-image upload) |
| `requests/` | create |
| `profile/` | index (profile + picture) |
| `admin/` | login, logout, index, users, listings, reports, categories, analytics, messages |
| `api/` | favorite, report, contact, request_action, mark_read, admin_action |
| `database/schema.sql` | 12 tables + demo data |
| `supabase/` | Postgres migration + seed (optional cloud path) |

### 1.2 Database (MySQL `reuse_campus`)
12 tables: `users`, `admins`, `categories`, `listings`, `listing_images`, `item_requests`, `favorites`, `notifications`, `contact_messages`, `reports`, `exchange_history`, `reviews`.
Relations: listings→users/categories, listing_images→listings, item_requests→listings/users(requester+owner), favorites→users/listings, notifications→users, reports→reporter/listing/reported user, exchange_history→listing/users, reviews→listing/users.
Demo data: 8 users, 8 categories, 10 listings, 1 request, 1 exchange, favorites, notifications. Password hash = bcrypt of `password`.

### 1.3 Auth / authorization
- Session-based (`$_SESSION['user_id']`, `admin_id`), `password_hash`/`password_verify`, CSRF token in meta tag + hidden field, `requireLogin()` / `requireAdmin()` (student/admin RBAC), ownership re-checks in API endpoints.
- Email verification token flow, password reset token flow (logged to `storage/` in demo mode).

### 1.4 Business logic to preserve
- Exchange types: donation / borrow / exchange / sale. Conditions: new / like_new / good / fair. Request statuses: pending / accepted / rejected / completed / cancelled.
- Request workflow: send → accept/reject (owner) → cancel (requester) → complete / confirm return (borrow) → exchange_history + notifications for both parties. Listing availability/status updated on accept/complete.
- Rule-based matching: +40 same category, +25 same exchange type, +20 same college, +8 title keyword; cap 100; reasons displayed. **No AI claim.**
- Admin: suspend/activate users, approve/remove listings, review reports (reviewed/resolved/dismissed), category CRUD, contact messages, live analytics.
- Search/filter/sort/pagination on explore; grid/list view; favorites AJAX.
- Multi-image upload with MIME/size validation; safe random filenames.

### 1.5 Weaknesses in the PHP version (addressed in migration)
- No framework-level CSRF on GET state changes; ad-hoc input validation.
- Raw SQL strings with manual escaping; no ORM type safety.
- Double-quoted SQL literals (MySQL-specific).
- Session cookies without explicit `SameSite`/`Secure` flags.
- No password strength policy, no rate limiting on login.
- Mixed HTML/PHP in pages; no component model.
- No dark mode, no loading skeletons, no toasts.

## 2. Target architecture

```
reuse-campus-next/
  src/app/
    (public)/            home, explore, listing/[id], about, how-it-works, contact
    (auth)/login, register, forgot-password, reset-password, verify
    dashboard/           overview, listings, requests, incoming, saved, history, notifications
    listings/new, listings/[id]/edit
    requests/new
    profile/
    admin/               overview, users, listings, reports, categories, messages, analytics
    api/                 upload, health  (route handlers only where needed)
  src/actions/           server actions: auth, listings, requests, favorites, reports, admin, profile, contact
  src/components/ui/     shadcn/ui primitives
  src/components/        navbar, sidebar, listing-card, filters, stat-card, empty-state, theme-toggle, providers
  src/lib/               prisma, auth, validation (zod), matching, helpers, upload, constants
  src/types/             shared types
  prisma/schema.prisma   introspected from live MySQL (preserve names + relations)
  public/uploads/        user uploads (same filename convention)
  public/images/         original SVG artwork
```

## 3. Migration phases
1. Scaffold Next.js 15+/TS/Tailwind/shadcn, install deps, Prisma introspect + generate.
2. Foundation: Prisma client, Auth.js credentials provider (bcryptjs), Zod schemas, RBAC guards, theme provider, toasts, navbar/sidebar, upload handler.
3. Public pages + listing cards + detail + matching engine.
4. Auth flows (register/login/logout/forgot/reset/verify) + profile.
5. Listing CRUD with multi-image upload.
6. Request workflow + notifications + history + favorites.
7. Admin panel (all 7 modules) + analytics.
8. Polish: skeletons, dark mode, responsive checks, error boundaries.
9. QA: `prisma validate`, `tsc --noEmit`, `next build`, smoke test routes against real MySQL.

## 4. Data safety
- **No destructive migrations.** Prisma schema is generated with `db pull` (read-only introspection).
- Existing MySQL database and demo accounts are reused as-is.
- Uploaded files are copied, not deleted.

## 5. Key design decisions
- Prisma model/field names preserved from DB (`@@map` not required since tables keep snake_case via introspection).
- Auth.js JWT sessions (credentials provider) to avoid session-table changes; bcryptjs verifies existing `$2y$` hashes.
- Server Actions for all mutations (CSRF handled by Next.js action IDs + origin checks); Route Handlers only for file upload and health check.
- `next/image` with `unoptimized` for user uploads served from local `public/`.
- Server Components for data fetching; Client Components only for interactivity.
