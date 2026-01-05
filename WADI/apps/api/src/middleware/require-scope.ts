import type { Request, Response, NextFunction } from "express";
import type { Scope } from "@wadi/core";

export function requireScope(scope: Scope) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
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
