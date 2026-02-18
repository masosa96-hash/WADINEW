import { Request, Response, NextFunction } from "express";
import { logger } from "../core/logger";

export class AppError extends Error {
  public code: string;
  public statusCode: number;

  constructor(code: string, message: string, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isProduction = process.env.NODE_ENV === 'production';

  logger.error(err.message, {
    stack: isProduction ? undefined : err.stack,
    path: req.path,
    method: req.method,
    requestId: (req as any).requestId
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      code: err.code || "INTERNAL_ERROR",
      message: err.message,
    });
  }

  // Handle generic errors
  return res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: isProduction ? "Internal Server Error" : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
