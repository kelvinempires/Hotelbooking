import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByGuest,
  updatePaymentStatus,
  cancelBooking,
  getBookingStats,
  getMyBookings,
  getPublicBooking,
} from "../controllers/bookingController.js";
import { protect, optionalAuth, admin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/", createBooking); // Public booking creation
router.get("/public/:id", getPublicBooking); // Public booking lookup (with limited info)

// Protected routes (all routes below require authentication)
router.use(protect);

// User routes - any authenticated user can access these
router.get("/my-bookings", getMyBookings); // Get current user's bookings
router.get("/:id", getBookingById);
router.patch("/:id/cancel", cancelBooking);

// Admin/Owner routes - require admin privileges
router.get("/", admin, getBookings);
router.get("/stats/dashboard", admin, getBookingStats);
router.get("/guest/:email", admin, getBookingsByGuest);
router.put("/:id", admin, updateBooking);
router.patch("/:id/payment", admin, updatePaymentStatus);
router.delete("/:id", admin, deleteBooking);

export default router;
