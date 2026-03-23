import pkg from "pg";
const { Pool } = pkg;

const isProduction = process.env.DATABASE_URL?.includes("supabase");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false
});

export default pool;