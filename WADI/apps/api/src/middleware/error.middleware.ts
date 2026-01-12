import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

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
    message: "Something went wrong on our end.",
  });
};
