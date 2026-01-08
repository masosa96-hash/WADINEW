import { Request, Response, NextFunction } from "express";
import { Scope } from "@wadi/core";
import { AuthenticatedRequest } from "./auth";

export function requireScope(scope: Scope) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as unknown as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    if (
      user.scopes.includes("admin:*") ||
      user.scopes.includes(scope)
    ) {
      return next();
    }

    return res.status(403).json({ error: "Forbidden" });
  };
}
