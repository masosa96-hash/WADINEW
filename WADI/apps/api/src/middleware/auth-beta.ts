import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";
import { AppError } from "./error.middleware";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    // Add other properties as needed
  };
}

export const authenticate = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Malformed Authorization header" });
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.error("Auth Middleware Failed:", { error: error?.message, userFound: !!user });
        throw new AppError("UNAUTHORIZED", "Invalid token", 401, { details: error?.message });
      }

      (req as AuthenticatedRequest).user = {
        id: user.id,
        email: user.email,
      };

      next();
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err instanceof AppError) {
        return next(err);
      }
      throw new AppError("AUTH_ERROR", "Authentication failed", 500, { cause: err });
    }
  };
};
