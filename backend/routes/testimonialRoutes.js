import express from "express";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  markHelpful,
} from "../controllers/testimonialController.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getTestimonials);
router.post("/:id/helpful", markHelpful);

// Protected routes
router.post("/", optionalAuth, createTestimonial);
router.put("/:id", protect, updateTestimonial);

export default router;
