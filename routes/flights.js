import express from "express";
import multer from "multer";
import protect from "../middleware/auth.js";
import isAdmin from "../middleware/role.js";
import { flightValidator } from "../middleware/validators.js";
import {
  createFlight,
  getFlights,
  getFlight,
  updateFlight,
  deleteFlight,
} from "../controllers/flightController.js";

const router = express.Router();
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const imageFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files allowed"), false);
};
const upload = multer({ storage, fileFilter: imageFilter });

router.post("/", protect, isAdmin, upload.single("image"), createFlight);
router.post(
  "/",
  protect,
  isAdmin,
  upload.single("image"),
  flightValidator,
  createFlight,
);
router.get("/", getFlights);
router.get("/:id", getFlight);
router.put("/:id", protect, isAdmin, upload.single("image"), updateFlight);
router.delete("/:id", protect, isAdmin, deleteFlight);

export default router;
