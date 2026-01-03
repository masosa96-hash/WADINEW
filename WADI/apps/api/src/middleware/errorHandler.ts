import { Request, Response, NextFunction } from "express";
import { AppError } from "../core/errors";
import { logger } from "../core/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.status : 500;
  const code = isAppError ? err.code : "INTERNAL_ERROR";
  const message = err.message || "Internal Server Error";

  logger.error(message, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requestId: (req as any).requestId,
    stack: err.stack,
    code,
    status,
  });

  res.status(status).json({
    ok: false,
    error: {
      code,
      message,
    },
  });
};
