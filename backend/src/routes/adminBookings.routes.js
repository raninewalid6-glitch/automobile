import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  adminListBookings,
  adminGetBooking,
  adminUpdateBookingStatus,
} from "../controllers/bookings.controller.js";

const router = Router();

router.use(requireAuth, requireRole("SUPERADMIN", "MANAGER"));

router.get("/", adminListBookings);
router.get("/:id", adminGetBooking);
router.put("/:id/status", adminUpdateBookingStatus);

export default router;
