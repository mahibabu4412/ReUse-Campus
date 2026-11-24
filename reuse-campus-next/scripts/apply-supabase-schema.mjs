/**
 * Apply the prepared PostgreSQL schema + demo seed to Supabase.
 * Usage: node scripts/apply-supabase-schema.mjs
 * Requires DATABASE_URL (Postgres connection string) in the environment.
 *
 * This script is idempotent-ish: if public.users already exists, it skips the
 * schema and seed so existing data is never overwritten.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migration = path.resolve(root, "../reuse-campus/supabase/migrations/20261123000000_initial_schema.sql");
const seed = path.resolve(root, "../reuse-campus/supabase/seed.sql");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  const exists = await client.query(
    "SELECT to_regclass('public.users') AS table_name"
  );
  if (exists.rows[0]?.table_name) {
    console.log("public.users already exists — skipping schema/seed to protect existing data.");
  } else {
    const schemaSql = await readFile(migration, "utf8");
    await client.query(schemaSql);
    console.log("Applied schema.");
    const seedSql = await readFile(seed, "utf8");
    await client.query(seedSql);
    console.log("Applied demo seed.");
  }
  const counts = await client.query(
    "SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM listings) AS listings"
  );
  console.log("Rows:", counts.rows[0]);
} finally {
  await client.end();
}
