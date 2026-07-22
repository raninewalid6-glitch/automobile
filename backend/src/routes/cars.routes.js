import { Router } from "express";
import { listPublicCars, getPublicCar } from "../controllers/cars.controller.js";

const router = Router();

router.get("/", listPublicCars);
router.get("/:id", getPublicCar);

export default router;
