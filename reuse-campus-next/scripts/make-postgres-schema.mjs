/** Generate a Postgres-compatible copy of the introspected MySQL Prisma schema. */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "prisma/schema.prisma");
const target = path.join(root, "prisma/schema.postgres.prisma");

let sql = await readFile(source, "utf8");
sql = sql.replace('provider = "mysql"', 'provider = "postgresql"');
// MySQL-only native types have no Postgres equivalent.
sql = sql.replace(/ @db\.UnsignedInt/g, "").replace(/ @db\.TinyInt/g, "");
// Postgres connector has no FULLTEXT index and requires constraint names to be
// unique per model; drop those MySQL-introspection artifacts.
sql = sql.replace(/^.*@@fulltext\([^\n]*\)\n/gm, "");
sql = sql
  .split("\n")
  .map((line) => (line.includes("@relation(") ? line.replace(/,?\s*map: "[^"]+"/g, "") : line))
  .join("\n");
// Keep the same model/field names: the Supabase migration uses identical
// snake_case table and column names.
await writeFile(target, sql);
console.log(`Wrote ${target}`);
