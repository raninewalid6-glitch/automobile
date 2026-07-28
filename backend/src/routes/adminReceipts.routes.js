import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { adminListReceipts, adminCreateReceipt } from "../controllers/payments.controller.js";

const router = Router();

router.use(requireAuth, requireRole("SUPERADMIN", "MANAGER"));

router.get("/", adminListReceipts);
router.post("/", adminCreateReceipt);

export default router;
