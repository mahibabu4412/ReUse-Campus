# ReUse Campus — Smart Student Resource Exchange Platform

**Tagline:** Share More. Waste Less. Learn Together.

This repository contains both generations of the application:

| Folder | Description |
|---|---|
| [`reuse-campus-next/`](reuse-campus-next/) | **Recommended.** Full migration to Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma ORM, Auth.js, Zod and Lucide icons. Uses the same MySQL database. |
| [`reuse-campus/`](reuse-campus/) | Original PHP 8 + MySQL implementation (HTML/CSS/vanilla JS, PDO, session auth), including the full schema, demo data and Supabase (PostgreSQL) migration scaffolding. |

Both versions connect to the existing `reuse_campus` MySQL database and preserve all student data.

## Quick start (Next.js version)

```bash
cd reuse-campus-next
npm install
copy .env.example .env
npx prisma generate
npm run dev      # http://localhost:3000
```

See [`reuse-campus-next/README.md`](reuse-campus-next/README.md) for full setup, architecture and verification details.
See [`reuse-campus/README.md`](reuse-campus/README.md) for the original XAMPP instructions and [`SUPABASE.md`](reuse-campus/SUPABASE.md) for the optional Supabase path.

## Demo credentials

Password for all demo accounts: **`password`**

- Student: `ayesha@student.edu`
- Admin: `admin` (at `/admin/login` in the Next.js app, `admin/login.php` in the PHP app)
