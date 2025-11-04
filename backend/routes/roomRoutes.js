// routes/roomRoutes.js
import express from "express";
import {
  getRoomsByHotel,
  createRoom,
  updateRoom,
  getMyRooms,
  getRoom, // Add this
  updateRoomAvailability, // Add this
  deleteRoom, // Add this
} from "../controllers/roomController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/hotel/:hotelId", getRoomsByHotel);

// Protected routes
router.get("/owner/my-rooms", protect, getMyRooms); // <-- should come BEFORE any ":id"
router.get("/:id", getRoom); // <-- public single room details

router.post("/", protect, createRoom);
router.put("/:id", protect, updateRoom);
router.patch("/:id/availability", protect, updateRoomAvailability);
router.delete("/:id", protect, deleteRoom);

export default router;

