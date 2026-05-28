import { Router } from "express";
import {
  getAvailabilityForProduct,
  addBooking
} from "../controllers/schedule.controller.js";

const router = Router();

router.get("/", getAvailabilityForProduct);
router.post("/", addBooking)


export default router;
