import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  adminListPurchases,
  adminGetPurchase,
  adminUpdatePurchaseStatus,
} from "../controllers/purchases.controller.js";

const router = Router();

router.use(requireAuth, requireRole("SUPERADMIN", "MANAGER"));

router.get("/", adminListPurchases);
router.get("/:id", adminGetPurchase);
router.put("/:id/status", adminUpdatePurchaseStatus);

export default router;
