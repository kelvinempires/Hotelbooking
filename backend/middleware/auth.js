import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

// Protect routes with Clerk authentication
export const protect = ClerkExpressRequireAuth();

// Optional auth middleware
export const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) {
    return ClerkExpressRequireAuth()(req, res, next);
  }
  next();
};

// Admin middleware
export const admin = ClerkExpressRequireAuth();
