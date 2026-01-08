import { Request, Response, NextFunction } from "express";
import { User } from "@supabase/supabase-js";
import { AuthUser, Scope } from "@wadi/core";
import { supabase } from "../supabase";
import { AuthError } from "../core/errors";

export interface AuthenticatedRequest extends Request {
  user?: User & { scopes: Scope[] };
  userRole?: string;
}

/**
 * Validates the Supabase JWT.
 * Sets req.user if valid.
 */
export const authenticate = (optional = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        if (optional) {
          authReq.user = undefined;
          return next();
        }
        throw new AuthError("No authorization header provided");
      }

      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        if (optional) {
          authReq.user = undefined;
          return next();
        }
        throw new AuthError("Invalid or expired token");
      }

      // Attach user to request with scopes from metadata
      const scopes = (user.user_metadata?.scopes as Scope[]) || ["chat:read", "chat:write"];
      
      authReq.user = {
        ...user,
        scopes
      };

      // Determine Role
      authReq.userRole = user.user_metadata?.role || "USER";

      next();
    } catch (err) {
      if (optional) {
        (authReq as any).user = undefined;
        return next();
      }
      next(err);
    }
  };
};

/**
 * Middleware to restrict access to specific roles.
 * Must be placed AFTER authenticate().
 * @param {string[]} allowedRoles - Array of allowed roles, e.g. ['ADMIN']
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.userRole) {
      return next(new AuthError("User not authenticated"));
    }

    if (!allowedRoles.includes(authReq.userRole)) {
      return next(new AuthError("Insufficient permissions"));
    }

    next();
  };
};
