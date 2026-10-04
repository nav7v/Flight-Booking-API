import express from "express";
import protect from "../middleware/auth.js";
import isAdmin from "../middleware/role.js";
import {
  createBooking,
  getBooking,
  requestCancel,
  adminCancel,
} from "../controllers/bookingController.js";
import { bookingValidator } from "../middleware/validators.js";

const router = express.Router();

router.post("/", protect, bookingValidator, createBooking);
router.get("/:id", protect, getBooking);
router.put("/:id/request-cancel", protect, requestCancel);
router.put("/:id/cancel", protect, isAdmin, adminCancel);

export default router;
