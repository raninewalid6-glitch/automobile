import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { adminListOwners, adminGetOwner, adminCreateOwner } from "../controllers/owners.controller.js";

const router = Router();

router.use(requireAuth, requireRole("SUPERADMIN", "MANAGER"));

router.get("/", adminListOwners);
router.get("/:id", adminGetOwner);
router.post("/", adminCreateOwner);

export default router;
