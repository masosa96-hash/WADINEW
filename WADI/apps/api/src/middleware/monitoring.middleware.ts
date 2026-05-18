import { Request, Response, NextFunction } from "express";
import { metricsHistory } from "../services/metrics-history.service";
import { alerting } from "../services/alerting.service";

/**
 * Middleware to record metrics and evaluate alerts
 * Must be placed after response is sent
 */
export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Capture the original res.end function
  const originalEnd = res.end;

  res.end = function (chunk?: any, encoding?: any) {
    const statusCode = res.statusCode;
    const latencyMs = Date.now() - startTime;
    const endpoint = `${req.method} ${req.path}`;

    // Record metric
    metricsHistory.recordMetric(statusCode, latencyMs, endpoint);

    // Evaluate alerts every 10 requests (performance optimization)
    if (metricsHistory.getMetricsCount() % 10 === 0) {
      alerting.evaluateRules();
    }

    // Call original end
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};
