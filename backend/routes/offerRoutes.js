import express from "express";
import {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  validatePromoCode,
  toggleOfferActive,
  getFeaturedOffers,
} from "../controllers/offerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getOffers);
router.get("/featured", getFeaturedOffers);
router.get("/:id", getOffer);
router.post("/validate-promo", validatePromoCode);

// Protected routes (hotel owners only)
router.post("/", protect, createOffer);
router.put("/:id", protect, updateOffer);
router.delete("/:id", protect, deleteOffer);
router.patch("/:id/toggle-active", protect, toggleOfferActive);

export default router;
