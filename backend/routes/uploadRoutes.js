// routes/uploadRoutes.js
import express from "express";
import {
  uploadMiddleware,
  uploadImage,
} from "../controllers/uploadController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, uploadMiddleware, uploadImage);

export default router;
