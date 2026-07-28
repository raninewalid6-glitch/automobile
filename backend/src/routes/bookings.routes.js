import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createBooking, myBookings } from "../controllers/bookings.controller.js";

const router = Router();

// Il faut être connecté pour réserver ou voir ses réservations
router.use(requireAuth);

router.post("/", createBooking);
router.get("/me", myBookings);

export default router;
