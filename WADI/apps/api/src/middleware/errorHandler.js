import { AppError } from "../core/errors.js";
import { logger } from "../core/logger.js";

export const errorHandler = (err, req, res, next) => {
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.status : 500;
  const code = isAppError ? err.code : "INTERNAL_ERROR";
  const message = err.message || "Internal Server Error";

  logger.error(message, {
    requestId: req.requestId,
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
