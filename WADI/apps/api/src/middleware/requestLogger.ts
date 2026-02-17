import { Request, Response, NextFunction } from "express";
import { logger } from "../core/logger";
import crypto from "crypto";


export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const requestId = req.headers["rndr-id"] || req.headers["x-request-id"] || crypto.randomUUID();
  (req as any).requestId = requestId;

  // Hook into response finish
  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info("request_completed", {
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      latency_ms: duration,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      userId: (req as any).user?.id || "anonymous"
    });
  });

  next();
};
