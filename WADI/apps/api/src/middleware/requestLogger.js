import { logger } from "../core/logger.js";
import crypto from "crypto";
import { recordMetric } from "../routes/monitoring.js";

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  req.requestId = req.headers["x-request-id"] || crypto.randomUUID();

  // Hook into response finish
  res.on("finish", () => {
    const duration = Date.now() - start;

    // Recording metrics
    recordMetric(res.statusCode, duration);

    logger.info("Request processed", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      latency: duration,
      userId:
        (req.query && req.query.user_id) ||
        (req.body && req.body.user_id) ||
        "anonymous", // Best effort
      userAgent: req.get("user-agent"),
    });
  });

  next();
};
