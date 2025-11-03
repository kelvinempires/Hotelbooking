import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// CORS configuration for Vite frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.static("public"));

// Import routes
import hotelRoutes from "./routes/hotelRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import seedRoutes from "./routes/seedRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

// Routes
app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/owner", dashboardRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

app.get("/", (req, res) => {
  res.send("Welcome to the Hotel Booking API!");
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hotel-booking")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

export default app;
