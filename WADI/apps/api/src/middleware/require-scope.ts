import { Request, Response, NextFunction } from "express";
import { Scope } from "@wadi/core";
import { AuthenticatedRequest } from "./auth";
import { AppError } from "./error.middleware";

export function requireScope(scope: Scope) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as unknown as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      throw new AppError("UNAUTHORIZED", "Unauthenticated", 401);
    }

    if (
      user.scopes.includes("admin:*") ||
      user.scopes.includes(scope)
    ) {
      return next();
    }

    throw new AppError("FORBIDDEN", "Forbidden", 403);
  };
}
