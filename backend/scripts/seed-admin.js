// Crée (ou remet à jour) le compte SUPERADMIN défini dans .env
// Usage : npm run seed:admin
import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "../src/config/db.js";

const email = (process.env.ADMIN_EMAIL || "admin@djibdrive.com").toLowerCase();
const password = process.env.ADMIN_PASSWORD || "admin123";
const fullName = process.env.ADMIN_NAME || "Super Admin";

const passwordHash = await bcrypt.hash(password, 10);

const { rows } = await pool.query(
  `INSERT INTO users (full_name, email, password_hash, role)
   VALUES ($1, $2, $3, 'SUPERADMIN')
   ON CONFLICT (email)
   DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'SUPERADMIN'
   RETURNING id, email, role`,
  [fullName, email, passwordHash]
);

console.log("✅ Compte admin prêt :", rows[0]);
await pool.end();
