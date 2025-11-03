import express from "express";
import {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  getMyHotels,
} from "../controllers/hotelController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getHotels);
router.get("/:id", getHotel);

// Protected routes
router.post("/", protect, createHotel);
router.put("/:id", protect, updateHotel);
router.get("/owner/my-hotels", protect, getMyHotels);

export default router;
