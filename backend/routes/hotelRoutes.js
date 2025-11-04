import express from "express";
import {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  getMyHotels,
  deleteHotel,
  getFeaturedHotels,
} from "../controllers/hotelController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getHotels);
router.get("/featured/list", getFeaturedHotels); // <-- featured hotels route
router.get("/:id", getHotel);

// Protected routes
router.post("/", protect, createHotel);
router.put("/:id", protect, updateHotel);
router.delete("/:id", protect, deleteHotel); // <-- delete route added
router.get("/owner/my-hotels", protect, getMyHotels);

export default router;
