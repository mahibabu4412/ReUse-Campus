/** Generate the right Prisma client for the active driver (mysql or postgres). */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isPg = (process.env.DB_DRIVER ?? "").toLowerCase() === "pgsql";
const schema = path.join(root, isPg ? "prisma/schema.postgres.prisma" : "prisma/schema.prisma");

const cli = path.join(root, "node_modules", "prisma", "build", "index.js");
const result = spawnSync(process.execPath, [cli, "generate", "--schema", schema], {
  cwd: root,
  stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status ?? 1);
