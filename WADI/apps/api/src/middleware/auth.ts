import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase"; // .ts now
import { AuthError } from "../core/errors"; // .ts now

export interface AuthenticatedRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any; // Supabase user type is complex, using any or User from @supabase/supabase-js if I import it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userRole?: any;
}

/**
 * Validates the Supabase JWT.
 * Sets req.user if valid.
 * @param {boolean} optional - If true, continues even if no user found (Guest mode).
 */
export const authenticate = (optional = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        if (optional) {
          authReq.user = null;
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
          authReq.user = null;
          return next();
        }
        throw new AuthError("Invalid or expired token");
      }

      // Attach user to request
      authReq.user = user;

      // Determine Role (Default to USER if not set)
      // Since this is a simple implementation, we check user_metadata.
      // E.g. user.user_metadata.role
      authReq.userRole = user.user_metadata?.role || "USER";

      next();
    } catch (err) {
      if (optional) {
        authReq.user = null;
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
    if (!authReq.user) {
      return next(new AuthError("User not authenticated"));
    }

    if (!allowedRoles.includes(authReq.userRole)) {
      return next(new AuthError("Insufficient permissions"));
    }

    next();
  };
};
