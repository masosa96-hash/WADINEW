import { supabase } from "../supabase.js";
import { AuthError } from "../core/errors.js";

/**
 * Validates the Supabase JWT.
 * Sets req.user if valid.
 * @param {boolean} optional - If true, continues even if no user found (Guest mode).
 */
export const authenticate = (optional = false) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        if (optional) {
          req.user = null;
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
          req.user = null;
          return next();
        }
        throw new AuthError("Invalid or expired token");
      }

      // Attach user to request
      req.user = user;

      // Determine Role (Default to USER if not set)
      // Since this is a simple implementation, we check user_metadata.
      // E.g. user.user_metadata.role
      req.userRole = user.user_metadata?.role || "USER";

      next();
    } catch (err) {
      if (optional) {
        req.user = null;
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
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthError("User not authenticated"));
    }

    if (!allowedRoles.includes(req.userRole)) {
      return next(new AuthError("Insufficient permissions"));
    }

    next();
  };
};
