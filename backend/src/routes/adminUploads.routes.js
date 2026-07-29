import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { uploadMiddleware, uploadImages } from "../controllers/uploads.controller.js";

const router = Router();

router.post("/", requireAuth, requireRole("SUPERADMIN", "MANAGER"), (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE"
        ? "Fichier trop lourd (4 Mo maximum par photo)"
        : err.message;
      return res.status(400).json({ message });
    }
    uploadImages(req, res, next);
  });
});

export default router;
