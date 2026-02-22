import { Request, Response, NextFunction } from "express";
import { logger } from "../core/logger";
import crypto from "crypto";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const headerId = req.headers["x-request-id"] || req.headers["rndr-id"];
  const requestId = (Array.isArray(headerId) ? headerId[0] : headerId) || crypto.randomUUID();
  (req as unknown as { requestId: string }).requestId = requestId;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    logger[level]({
      msg: "inbound_request_completed",
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      latency_ms: duration,
      userId: (req as any).user?.id || "anonymous",
    });
  });

  next();
};
