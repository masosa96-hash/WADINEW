import { Request, Response, NextFunction } from "express";
import { AppError } from "../core/errors";
import { z } from "zod";

const ChatSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message too long (max 5000 chars)"),
});

const ProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name cannot be empty")
    .max(100, "Project name too long (max 100 chars)"),
});

const RunSchema = z.object({
  input: z
    .string()
    .min(1, "Input cannot be empty")
    .max(5000, "Input too long (max 5000 chars)"),
});

export const validateChatInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = ChatSchema.safeParse(req.body);

  if (!result.success) {
    const errorMsg = result.error.errors[0].message;
    return next(new AppError("VALIDATION_ERROR", errorMsg, 400));
  }

  next();
};

export const validateProjectInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = ProjectSchema.safeParse(req.body);

  if (!result.success) {
    const errorMsg = result.error.errors[0].message;
    return next(new AppError("VALIDATION_ERROR", errorMsg, 400));
  }

  next();
};

export const validateRunInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = RunSchema.safeParse(req.body);

  if (!result.success) {
    const errorMsg = result.error.errors[0].message;
    return next(new AppError("VALIDATION_ERROR", errorMsg, 400));
  }

  next();
};
