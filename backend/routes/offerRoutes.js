import express from "express";
import {
  getOffers,
  createOffer,
  updateOffer,
  validatePromoCode,
} from "../controllers/offerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getOffers);
router.post("/validate-promo", validatePromoCode);

// Protected routes
router.post("/", protect, createOffer);
router.put("/:id", protect, updateOffer);

export default router;
