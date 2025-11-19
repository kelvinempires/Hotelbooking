// middleware/auth.js
import { clerkMiddleware, getAuth } from "@clerk/express";

// Attach auth data (req.auth)
export const optionalAuth = clerkMiddleware();

// Protect middleware
export const protect = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ message: "Not authorized" });
  }
  next();
};

// Admin middleware (same for now)
export const admin = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ message: "Admin access denied" });
  }
  next();
};
