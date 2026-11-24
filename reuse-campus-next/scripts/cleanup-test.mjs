import pg from "pg";
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query("delete from listings where title = 'Production test listing'");
const r = await c.query("select count(*)::int as n from listings");
console.log("listings=" + r.rows[0].n);
await c.end();
