import express from "express";
import {
  getTestimonials,
  getTestimonial,
  getTestimonialsByHotel,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  markHelpful,
  approveTestimonial,
  toggleFeatureTestimonial
} from "../controllers/testimonialController.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getTestimonials);
router.get("/hotel/:hotelId", getTestimonialsByHotel); 
router.get("/:id", getTestimonial);
router.post("/:id/helpful", markHelpful);

// Protected routes
router.post("/", optionalAuth, createTestimonial);
router.put("/:id", protect, updateTestimonial);
router.patch("/:id/approve", protect, approveTestimonial);
router.patch("/:id/feature", protect, toggleFeatureTestimonial);
router.delete("/:id", protect, deleteTestimonial);

export default router;
