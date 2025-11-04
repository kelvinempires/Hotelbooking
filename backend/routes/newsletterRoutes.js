import express from "express";
import {
  subscribe,
  verifySubscription,
  updatePreferences,
  unsubscribe,
  getSubscribers,
  getNewsletterStats,
} from "../controllers/newsletterController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/subscribe", subscribe);
router.get("/verify", verifySubscription);
router.put("/preferences", updatePreferences);
router.post("/unsubscribe", unsubscribe);

// Admin routes
router.get("/subscribers", protect, admin, getSubscribers);
router.get("/stats", protect, admin, getNewsletterStats); // <-- missing one added

export default router;
