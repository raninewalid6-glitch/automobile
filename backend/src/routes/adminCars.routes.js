import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  adminListCars,
  adminGetCar,
  adminCreateCar,
  adminUpdateCar,
  adminDeleteCar,
} from "../controllers/cars.controller.js";

const router = Router();

// Toutes les routes admin exigent un token + un rôle admin
router.use(requireAuth, requireRole("SUPERADMIN", "MANAGER"));

router.get("/", adminListCars);
router.get("/:id", adminGetCar);
router.post("/", adminCreateCar);
router.put("/:id", adminUpdateCar);
router.delete("/:id", adminDeleteCar);

export default router;
