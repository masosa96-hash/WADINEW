import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

export const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 5 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many requests, please try again later.",
  },
  keyGenerator: (req: Request): string => {
    // Robust IP detection for proxies (Render, etc.)
    return (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
  },
});

