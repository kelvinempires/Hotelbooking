import express from "express";
import { seedDatabase, clearDatabase } from "../controllers/seedController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// These routes should be protected and ideally admin-only
router.post("/seed", protect, seedDatabase);
router.delete("/clear", protect, clearDatabase);

export default router;
