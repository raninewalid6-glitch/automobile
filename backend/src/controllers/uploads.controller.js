import multer from "multer";
import { query } from "../config/db.js";

// Formats d'image acceptés
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Réception des fichiers en mémoire (max 6 fichiers de 4 Mo chacun)
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format non supporté (JPEG, PNG, WebP ou GIF uniquement)"));
    }
  },
}).array("photos", 6);

// POST /api/admin/uploads — enregistre les photos dans la base et renvoie leurs URLs
export async function uploadImages(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const urls = [];
    for (const file of req.files) {
      const { rows } = await query(
        "INSERT INTO images (data, mime_type) VALUES ($1, $2) RETURNING id",
        [file.buffer, file.mimetype]
      );
      urls.push(`${req.protocol}://${req.get("host")}/api/images/${rows[0].id}`);
    }

    res.status(201).json({ urls });
  } catch (err) {
    next(err);
  }
}

// GET /api/images/:id — sert une photo (public, avec cache navigateur)
export async function serveImage(req, res, next) {
  try {
    const { rows } = await query("SELECT data, mime_type FROM images WHERE id = $1", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Image introuvable" });
    }
    res.set("Content-Type", rows[0].mime_type);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.send(rows[0].data);
  } catch (err) {
    if (err.code === "22P02") {
      return res.status(404).json({ message: "Image introuvable" });
    }
    next(err);
  }
}
