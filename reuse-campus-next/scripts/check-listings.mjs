import pg from "pg";
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query("select id,title,status from listings order by id desc limit 3");
console.log(JSON.stringify(r.rows));
await c.end();
