import { Request, Response, NextFunction } from "express";
import { AppError } from "../core/errors";
import { logger } from "../core/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.status : 500;
  const code = isAppError ? err.code : "INTERNAL_ERROR";
  
  const errorObj = err as { message?: string; stack?: string };
  const message = errorObj.message || "Internal Server Error";

  logger.error(message, {
    requestId: (req as any).requestId, // requestId might be added by a middleware
    stack: errorObj.stack,
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
