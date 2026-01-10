import { Request, Response, NextFunction } from "express";
import { AppError } from "../core/errors";
import { logger } from "../core/logger";

import { ZodError } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Internal Server Error";

  if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    message = err.message;
  } else if (err instanceof ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Validation Error";
    // Append detailed validation issues if needed, or format message
    // message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  } else if (err instanceof Error) {
    message = err.message;
  }

  const errorObj = err as { message?: string; stack?: string };

  // Only log full stack for 500s or explicit log requests
  if (status >= 500) {
    logger.error(message, {
        requestId: (req as any).requestId,
        stack: errorObj.stack,
        code,
        status,
    });
  } else {
    logger.warn(message, {
        requestId: (req as any).requestId,
        code,
        status,
    });
  }

  res.status(status).json({
    ok: false,
    error: {
      code,
      message,
      issues: err instanceof ZodError ? err.errors : undefined,
    },
  });
};
