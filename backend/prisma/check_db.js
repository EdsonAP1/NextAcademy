const { Pool } = require('pg');

const pool = new Pool({ connectionString: "postgresql://postgres:postgres123@localhost:5432/nextacademy?schema=public" });

async function main() {
  const res = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log("Tables in database:", res.rows.map(r => r.table_name));
}

main().catch(err => {
  console.error(err);
}).finally(async () => {
  await pool.end();
});
