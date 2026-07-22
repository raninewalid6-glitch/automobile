import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

const PUBLIC_USER_FIELDS = "id, full_name, phone, email, role, city, address, created_at";

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { fullName, email, password, phone, city, address } = req.body || {};

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email et password sont obligatoires" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit faire au moins 6 caractères" });
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Un compte existe déjà avec cet email" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (full_name, email, password_hash, phone, city, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${PUBLIC_USER_FIELDS}`,
      [fullName.trim(), email.toLowerCase().trim(), passwordHash, phone || null, city || null, address || null]
    );

    const user = rows[0];
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email et password sont obligatoires" });
    }

    const { rows } = await query(
      `SELECT ${PUBLIC_USER_FIELDS}, password_hash FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    const user = rows[0];
    const valid = user && (await bcrypt.compare(password, user.password_hash));
    if (!valid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    delete user.password_hash;
    res.json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (protégé)
export async function me(req, res, next) {
  try {
    const { rows } = await query(`SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE id = $1`, [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
}
