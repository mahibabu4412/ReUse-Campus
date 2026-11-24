/** Convert MySQL-style TINYINT(1) columns created as INTEGER into real BOOLEAN. */
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const targets = [
  ["users", "email_verified"],
  ["item_requests", "return_confirmed"],
  ["notifications", "is_read"],
  ["contact_messages", "is_read"],
  ["listing_images", "is_primary"],
];

try {
  for (const [table, column] of targets) {
    // Drop the CHECK constraint created by the migration (name is predictable,
    // but look it up defensively from the catalog).
    const found = await client.query(
      `SELECT conname FROM pg_constraint
       WHERE conrelid = $1::regclass AND contype = 'c'
         AND pg_get_constraintdef(oid) ILIKE $2`,
      [table, `%${column}%`]
    );
    for (const row of found.rows) {
      await client.query(`ALTER TABLE ${table} DROP CONSTRAINT ${row.conname}`);
    }
    await client.query(
      `ALTER TABLE ${table} ALTER COLUMN ${column} DROP DEFAULT`
    );
    await client.query(
      `ALTER TABLE ${table} ALTER COLUMN ${column} TYPE boolean USING ${column} = 1`
    );
    await client.query(
      `ALTER TABLE ${table} ALTER COLUMN ${column} SET DEFAULT false`
    );
    console.log(`Converted ${table}.${column} to boolean`);
  }
} finally {
  await client.end();
}
