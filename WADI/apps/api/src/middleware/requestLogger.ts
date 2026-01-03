import { Request, Response, NextFunction } from "express";
import { logger } from "../core/logger";
import crypto from "crypto";
import { recordMetric } from "../routes/monitoring";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req as any).requestId = req.headers["x-request-id"] || crypto.randomUUID();

  // Hook into response finish
  res.on("finish", () => {
    const duration = Date.now() - start;

    // Recording metrics
    recordMetric(res.statusCode, duration);

    logger.info("Request processed", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      requestId: (req as any).requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      latency: duration,
      userId:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req.query && (req.query as any).user_id) ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req.body && (req.body as any).user_id) ||
        "anonymous", // Best effort
      userAgent: req.get("user-agent"),
    });
  });

  next();
};
