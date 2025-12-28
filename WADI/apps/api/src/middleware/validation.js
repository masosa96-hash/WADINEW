import { AppError } from "../core/errors.js";

export const validateChatInput = (req, res, next) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return next(
      new AppError(
        "VALIDATION_ERROR",
        "Message is required and must be a string"
      )
    );
  }

  if (message.trim().length === 0) {
    return next(new AppError("VALIDATION_ERROR", "Message cannot be empty"));
  }

  if (message.length > 5000) {
    return next(
      new AppError("VALIDATION_ERROR", "Message too long (max 5000 chars)")
    );
  }

  next();
};

export const validateProjectInput = (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== "string") {
    return next(new AppError("VALIDATION_ERROR", "Project name is required"));
  }

  if (name.trim().length === 0) {
    return next(
      new AppError("VALIDATION_ERROR", "Project name cannot be empty")
    );
  }

  if (name.length > 100) {
    return next(
      new AppError("VALIDATION_ERROR", "Project name too long (max 100 chars)")
    );
  }

  next();
};

export const validateRunInput = (req, res, next) => {
  const { input } = req.body;

  if (!input || typeof input !== "string") {
    return next(
      new AppError("VALIDATION_ERROR", "Input is required and must be a string")
    );
  }

  if (input.trim().length === 0) {
    return next(new AppError("VALIDATION_ERROR", "Input cannot be empty"));
  }

  if (input.length > 5000) {
    return next(
      new AppError("VALIDATION_ERROR", "Input too long (max 5000 chars)")
    );
  }

  next();
};
