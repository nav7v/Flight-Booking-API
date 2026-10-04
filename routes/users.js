import express from "express";
import multer from "multer";
import protect from "../middleware/auth.js";
import { getProfile, updateProfile } from "../controllers/userController.js";

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

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("profilePicture"), updateProfile);

export default router;
