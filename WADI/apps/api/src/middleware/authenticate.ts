import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { AuthUser } from "@wadi/core";

// Declare module extension to type req.user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
      // audience: "wadi-api", // Comented out until tokens are properly issued with this claim
      // issuer: "wadi", // Comented out until tokens are properly issued with this claim
    }) as jwt.JwtPayload;
    
    // Fallback for sub if not present (legacy tokens maybe?)
    if (!payload.sub) {
       // Ideally throw error, but let's see. 
       // For now, strict:
       throw new Error("Invalid token payload: missing sub");
    }

    req.user = {
      id: payload.sub as string,
      scopes: (payload.scopes as AuthUser["scopes"]) || [], // Default to empty array if no scopes
    };

    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
