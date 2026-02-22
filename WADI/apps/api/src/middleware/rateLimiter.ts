import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

export const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests" },
});

export const expensiveRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: "AI limits exceeded for this hour. Please wait." },
});

// --- Budget Guard (Global Daily Cap) ---
// Note: In a production environment with multiple instances, this would use Redis.
// For the 14-day soft launch, a memory-based guard is sufficient for a single instance.
let dailyGlobalCount = 0;
let lastReset = Date.now();

const GLOBAL_DAILY_LIMIT = 200;

export const globalBudgetGuard = (req: Request, res: Response, next: any) => {
  const now = Date.now();
  // Reset at midnight or every 24h
  if (now - lastReset > 24 * 60 * 60 * 1000) {
    dailyGlobalCount = 0;
    lastReset = now;
  }

  if (dailyGlobalCount >= GLOBAL_DAILY_LIMIT) {
    return res.status(503).json({ 
      error: "Global daily budget reached. AI features are temporarily paused for safety." 
    });
  }

  // Increment is handled in the controller after a successful start, 
  // or here if we want to be conservative (pre-decrement).
  next();
};

export const incrementGlobalBudget = () => {
  dailyGlobalCount++;
};

export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Admin rate limit exceeded" },
});

