import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createPurchase, myPurchases } from "../controllers/purchases.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createPurchase);
router.get("/me", myPurchases);

export default router;
