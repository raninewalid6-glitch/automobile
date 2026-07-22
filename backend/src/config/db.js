import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("⚠  DATABASE_URL manquante — crée backend/.env à partir de .env.example");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // requis par Neon
  max: 5,
});

// Petit helper : query("SELECT ...", [params])
export const query = (text, params) => pool.query(text, params);
