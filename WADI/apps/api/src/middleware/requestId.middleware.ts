import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Middleware para agregar Request ID único a cada request
 * Permite correlacionar logs y errores
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers["x-request-id"] as string || uuidv4();
  
  // Adjuntar al request para acceso posterior
  (req as any).requestId = requestId;
  
  // Adjuntar al response headers
  res.setHeader("X-Request-ID", requestId);
  
  // Adjuntar al locals para acceso en templates
  res.locals.requestId = requestId;
  
  next();
}
