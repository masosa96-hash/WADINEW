import { RateLimitError } from "../core/errors.js";

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 30;

const hits = new Map();

export const rateLimiter = (req, res, next) => {
  // Use IP or UserID as key
  const key =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  const now = Date.now();
  const record = hits.get(key);

  if (!record) {
    hits.set(key, { count: 1, startTime: now });
    return next();
  }

  if (now - record.startTime > WINDOW_MS) {
    // Reset window
    record.count = 1;
    record.startTime = now;
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    return next(
      new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil((record.startTime + WINDOW_MS - now) / 1000)} seconds.`
      )
    );
  }

  record.count += 1;
  next();
};
