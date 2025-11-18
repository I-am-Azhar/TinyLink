import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sql = `CREATE TABLE IF NOT EXISTS links (
  code VARCHAR(8) PRIMARY KEY,
  url TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  last_clicked TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;
async function main() {
  try {
    await pool.query(sql);
    console.log('links table ready');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();

