import { Request, Response, NextFunction } from "express";
import { logger } from "../core/logger";

export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public meta?: Record<string, unknown>;

  constructor(code: string, message: string, statusCode = 500, meta?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.meta = meta;
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const isProduction = process.env.NODE_ENV === "production";
  const statusCode = err.statusCode || err.status || 500;
  const requestId = (req as unknown as { requestId?: string }).requestId;

  // Structured logging with Pino
  logger.error({
    msg: "uncaught_exception",
    error: {
      message: err.message,
      code: err.code || "INTERNAL_ERROR",
      stack: isProduction ? undefined : err.stack,
      meta: err.meta,
    },
    context: {
      path: req.path,
      method: req.method,
      requestId,
      userId: (req as any).user?.id,
    }
  });

  return res.status(statusCode).json({
    status: "error",
    requestId,
    error: {
      message: isProduction && statusCode === 500 ? "Service Unavailable" : err.message,
      code: err.code || "INTERNAL_SERVER_ERROR",
      ...(isProduction ? {} : { stack: err.stack, meta: err.meta }),
    },
  });
};
