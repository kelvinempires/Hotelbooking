import express from "express";
import {
  getRoomsByHotel,
  createRoom,
  updateRoom,
  getMyRooms,
} from "../controllers/roomController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/hotel/:hotelId", getRoomsByHotel);

// Protected routes
router.post("/", protect, createRoom);
router.put("/:id", protect, updateRoom);
router.get("/owner/my-rooms", protect, getMyRooms);

export default router;
