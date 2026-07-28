import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  adminListPayments,
  adminCreatePayment,
  adminUpdatePaymentStatus,
} from "../controllers/payments.controller.js";

const router = Router();

router.use(requireAuth, requireRole("SUPERADMIN", "MANAGER"));

router.get("/", adminListPayments);
router.post("/", adminCreatePayment);
router.put("/:id/status", adminUpdatePaymentStatus);

export default router;
