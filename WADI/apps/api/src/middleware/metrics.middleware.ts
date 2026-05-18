import { Request, Response, NextFunction } from "express";
import { recordHttpMetric } from "../services/http-metrics.service";

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const latencyMs = Date.now() - start;
    recordHttpMetric(res.statusCode, latencyMs);
  });

  next();
};
