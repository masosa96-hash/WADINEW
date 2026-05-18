import { Router, Request, Response } from "express";
import { metricsHistory } from "../services/metrics-history.service";
import { alerting } from "../services/alerting.service";

const router = Router();

/**
 * GET /metrics
 * Prometheus format metrics endpoint
 * Compatible with Prometheus scraping
 */
router.get("/metrics", (req: Request, res: Response) => {
  const metrics = metricsHistory.getHistoricalMetrics();
  const alerts = alerting.getAlertSummary();

  let output = "# HELP WADI API Metrics\n";
  output += "# TYPE WADI API Metrics\n\n";

  // Request metrics
  output += `# HELP wadi_http_requests_total Total HTTP requests\n`;
  output += `# TYPE wadi_http_requests_total counter\n`;
  output += `wadi_http_requests_total{status="2xx"} ${metrics.statusDistribution["2xx"] || 0}\n`;
  output += `wadi_http_requests_total{status="4xx"} ${metrics.statusDistribution["4xx"] || 0}\n`;
  output += `wadi_http_requests_total{status="5xx"} ${metrics.statusDistribution["5xx"] || 0}\n\n`;

  // Error rate
  output += `# HELP wadi_error_rate_ratio Error rate ratio (0-1)\n`;
  output += `# TYPE wadi_error_rate_ratio gauge\n`;
  output += `wadi_error_rate_ratio ${metrics.errorRate}\n\n`;

  // Latency percentiles
  output += `# HELP wadi_request_latency_ms Request latency in milliseconds\n`;
  output += `# TYPE wadi_request_latency_ms histogram\n`;
  output += `wadi_request_latency_ms{quantile="0.5"} ${metrics.p50}\n`;
  output += `wadi_request_latency_ms{quantile="0.95"} ${metrics.p95}\n`;
  output += `wadi_request_latency_ms{quantile="0.99"} ${metrics.p99}\n\n`;

  // Alert status
  output += `# HELP wadi_active_alerts_total Active alerts by level\n`;
  output += `# TYPE wadi_active_alerts_total gauge\n`;
  output += `wadi_active_alerts_total{level="critical"} ${alerts.critical}\n`;
  output += `wadi_active_alerts_total{level="warning"} ${alerts.warning}\n\n`;

  // Uptime
  output += `# HELP wadi_uptime_seconds Uptime in seconds\n`;
  output += `# TYPE wadi_uptime_seconds gauge\n`;
  output += `wadi_uptime_seconds ${Math.floor(process.uptime())}\n\n`;

  // Timestamp
  output += `# HELP wadi_scrape_timestamp_seconds Scrape timestamp\n`;
  output += `# TYPE wadi_scrape_timestamp_seconds gauge\n`;
  output += `wadi_scrape_timestamp_seconds ${Math.floor(Date.now() / 1000)}\n`;

  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(output);
});

/**
 * GET /metrics/json
 * JSON format metrics (alternative format)
 */
router.get("/metrics/json", (req: Request, res: Response) => {
  const metrics = metricsHistory.getHistoricalMetrics();
  const alerts = alerting.getAlertSummary();
  const slowest = metricsHistory.getSlowestEndpoints(5);

  res.json({
    timestamp: Date.now(),
    window: "1 hour rolling",
    requests: {
      total: metrics.totalRequests,
      errors: metrics.errorCount,
      errorRate: metrics.errorRate,
      distribution: metrics.statusDistribution
    },
    latency: {
      p50: metrics.p50,
      p95: metrics.p95,
      p99: metrics.p99
    },
    alerts: alerts,
    slowest: slowest,
    system: {
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage?.() || {}
    }
  });
});

export default router;
