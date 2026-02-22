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
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const isProduction = process.env.NODE_ENV === "production";
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorCode = err instanceof AppError ? err.code : "INTERNAL_SERVER_ERROR";
  const requestId = (req as unknown as { requestId?: string }).requestId;

  logger.error({
    msg: err.message,
    err,
    stack: isProduction ? undefined : err.stack,
    path: req.path,
    method: req.method,
    requestId,
    meta: err instanceof AppError ? err.meta : undefined,
  });

  return res.status(statusCode).json({
    status: "error",
    requestId,
    error: {
      code: errorCode,
      message: isProduction && statusCode === 500 ? "Internal Server Error" : err.message,
      ...(isProduction ? {} : { stack: err.stack, meta: (err as unknown as { meta?: Record<string, unknown> }).meta }),
    },
  });
};
