import { Router, Request, Response, NextFunction } from "express";
import { metricsHistory } from "../services/metrics-history.service";
import { alerting } from "../services/alerting.service";
import { AppError } from "../middleware/error.middleware";

const router = Router();

/**
 * GET /dashboard
 * Consolidated monitoring dashboard with all metrics and alerts
 */
router.get("/dashboard", (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = metricsHistory.getHistoricalMetrics();
    const healthStatus = alerting.getHealthStatus();
    const slowestEndpoints = metricsHistory.getSlowestEndpoints(5);
    const errorTrend = metricsHistory.getErrorTrend(5);
    const latencyTrend = metricsHistory.getLatencyTrend(5);

    res.json({
      timestamp: Date.now(),
      status: healthStatus.status,
      metrics: {
        requests: {
          total: metrics.totalRequests,
          errors: metrics.errorCount,
          errorRate: (metrics.errorRate * 100).toFixed(2) + "%"
        },
        latency: {
          p50: metrics.p50,
          p95: metrics.p95,
          p99: metrics.p99
        },
        statusDistribution: metrics.statusDistribution
      },
      health: healthStatus,
      slowest: slowestEndpoints,
      trends: {
        errors: errorTrend,
        latency: latencyTrend
      }
    });
  } catch (error: any) {
    throw new AppError("DB_ERROR", "Failed to retrieve dashboard metrics", 500, { cause: error });
  }
});

/**
 * GET /alerts
 * Get active alerts
 */
router.get("/alerts", (req: Request, res: Response) => {
  const summary = alerting.getAlertSummary();
  res.json({
    timestamp: Date.now(),
    ...summary
  });
});

/**
 * GET /alerts/history
 * Get alert history
 */
router.get("/alerts/history", (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 1000);
  const history = alerting.getAlertHistory(limit);

  res.json({
    timestamp: Date.now(),
    count: history.length,
    alerts: history
  });
});

/**
 * GET /metrics/historical
 * Get detailed historical metrics
 */
router.get("/metrics/historical", (req: Request, res: Response) => {
  const metrics = metricsHistory.getHistoricalMetrics();
  const breakdown = metricsHistory.getStatusCodeBreakdown();

  res.json({
    timestamp: Date.now(),
    summary: metrics,
    statusBreakdown: breakdown,
    window: "1 hour rolling"
  });
});

/**
 * GET /metrics/trends
 * Get error and latency trends
 */
router.get("/metrics/trends", (req: Request, res: Response) => {
  const minutesBack = Math.min(parseInt(req.query.minutes as string) || 5, 60);
  const errorTrend = metricsHistory.getErrorTrend(minutesBack);
  const latencyTrend = metricsHistory.getLatencyTrend(minutesBack);

  res.json({
    timestamp: Date.now(),
    minutesBack,
    errorTrend,
    latencyTrend
  });
});

/**
 * GET /health/detailed
 * Detailed health check including degradation info
 */
router.get("/health/detailed", (req: Request, res: Response) => {
  const isDegraded = metricsHistory.isDegraded();
  const alertSummary = alerting.getAlertSummary();
  const metrics = metricsHistory.getHistoricalMetrics();

  const statusCode = isDegraded || alertSummary.critical > 0 ? 503 : 200;

  res.status(statusCode).json({
    timestamp: Date.now(),
    status: isDegraded ? "degraded" : "healthy",
    isDegraded,
    metrics: {
      errorRate: (metrics.errorRate * 100).toFixed(2) + "%",
      p95: metrics.p95 + "ms",
      p99: metrics.p99 + "ms"
    },
    alerts: alertSummary
  });
});

/**
 * GET /status
 * Quick status endpoint
 */
router.get("/status", (req: Request, res: Response) => {
  const healthy = alerting.isHealthy();
  const metrics = metricsHistory.getHistoricalMetrics();

  res.status(healthy ? 200 : 503).json({
    timestamp: Date.now(),
    healthy,
    requests: metrics.totalRequests,
    errorRate: (metrics.errorRate * 100).toFixed(2) + "%"
  });
});

export default router;
