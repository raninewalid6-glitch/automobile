import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { adminStats } from "../controllers/stats.controller.js";

const router = Router();

router.use(requireAuth, requireRole("SUPERADMIN", "MANAGER"));

router.get("/", adminStats);

export default router;
