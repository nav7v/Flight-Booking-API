import express from "express";
import multer from "multer";
import { register, login, logout } from "../controllers/authController.js";
import { registerValidator, loginValidator } from "../middleware/validators.js";

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

router.post(
  "/register",
  upload.single("profilePicture"),
  registerValidator,
  register,
);
router.post("/login", login);
router.post("/login", loginValidator, login);
router.post("/logout", logout);

export default router;
