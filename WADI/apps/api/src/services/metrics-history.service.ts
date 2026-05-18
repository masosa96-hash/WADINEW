import { logger } from "../core/logger";

interface MetricPoint {
  timestamp: number;
  statusCode: number;
  latencyMs: number;
  endpoint?: string;
}

interface HistoricalMetrics {
  timestamp: number;
  totalRequests: number;
  errorCount: number;
  errorRate: number;
  p50: number;
  p95: number;
  p99: number;
  statusDistribution: { [key: string]: number };
}

/**
 * Tracks metrics in a rolling 1-hour window
 * Provides historical analysis for alerting and dashboards
 */
class MetricsHistoryService {
  private metrics: MetricPoint[] = [];
  private readonly WINDOW_SIZE_MS = 60 * 60 * 1000; // 1 hour
  private readonly MAX_METRICS = 10000; // Max points per window

  /**
   * Record a request metric
   */
  recordMetric(statusCode: number, latencyMs: number, endpoint?: string) {
    const point: MetricPoint = {
      timestamp: Date.now(),
      statusCode,
      latencyMs,
      endpoint
    };

    this.metrics.push(point);

    // Cleanup old metrics
    this.cleanup();
  }

  /**
   * Get metrics for the rolling window
   */
  getHistoricalMetrics(): HistoricalMetrics {
    const now = Date.now();
    const validMetrics = this.metrics.filter(m => now - m.timestamp < this.WINDOW_SIZE_MS);

    if (validMetrics.length === 0) {
      return {
        timestamp: now,
        totalRequests: 0,
        errorCount: 0,
        errorRate: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        statusDistribution: {}
      };
    }

    const errorCount = validMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = errorCount / validMetrics.length;

    // Calculate latency percentiles
    const latencies = validMetrics.map(m => m.latencyMs).sort((a, b) => a - b);
    const p50 = this.percentile(latencies, 0.5);
    const p95 = this.percentile(latencies, 0.95);
    const p99 = this.percentile(latencies, 0.99);

    // Status distribution
    const statusDistribution: { [key: string]: number } = {};
    validMetrics.forEach(m => {
      const statusGroup = `${Math.floor(m.statusCode / 100)}xx`;
      statusDistribution[statusGroup] = (statusDistribution[statusGroup] || 0) + 1;
    });

    return {
      timestamp: now,
      totalRequests: validMetrics.length,
      errorCount,
      errorRate,
      p50,
      p95,
      p99,
      statusDistribution
    };
  }

  /**
   * Get error trend (requests in last N minutes with status >= 400)
   */
  getErrorTrend(minutesBack: number = 5): {
    timestamp: number;
    errorRate: number;
    count: number;
  }[] {
    const now = Date.now();
    const windowStart = now - minutesBack * 60 * 1000;
    const recentMetrics = this.metrics.filter(m => m.timestamp >= windowStart);

    // Group by minute
    const minutes: { [minute: number]: { errors: number; total: number } } = {};

    recentMetrics.forEach(m => {
      const minute = Math.floor(m.timestamp / 60000) * 60000;
      if (!minutes[minute]) {
        minutes[minute] = { errors: 0, total: 0 };
      }
      minutes[minute].total++;
      if (m.statusCode >= 400) {
        minutes[minute].errors++;
      }
    });

    return Object.entries(minutes)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([minute, data]) => ({
        timestamp: Number(minute),
        errorRate: data.total > 0 ? data.errors / data.total : 0,
        count: data.errors
      }));
  }

  /**
   * Get latency trend (p95 over last N minutes)
   */
  getLatencyTrend(minutesBack: number = 5): {
    timestamp: number;
    p95: number;
    p99: number;
  }[] {
    const now = Date.now();
    const windowStart = now - minutesBack * 60 * 1000;
    const recentMetrics = this.metrics.filter(m => m.timestamp >= windowStart);

    // Group by minute
    const minutes: { [minute: number]: number[] } = {};

    recentMetrics.forEach(m => {
      const minute = Math.floor(m.timestamp / 60000) * 60000;
      if (!minutes[minute]) {
        minutes[minute] = [];
      }
      minutes[minute].push(m.latencyMs);
    });

    return Object.entries(minutes)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([minute, latencies]) => ({
        timestamp: Number(minute),
        p95: this.percentile(latencies, 0.95),
        p99: this.percentile(latencies, 0.99)
      }));
  }

  /**
   * Get requests by status code breakdown
   */
  getStatusCodeBreakdown() {
    const now = Date.now();
    const validMetrics = this.metrics.filter(m => now - m.timestamp < this.WINDOW_SIZE_MS);

    const breakdown: { [key: number]: number } = {};
    validMetrics.forEach(m => {
      breakdown[m.statusCode] = (breakdown[m.statusCode] || 0) + 1;
    });

    return breakdown;
  }

  /**
   * Get slowest endpoints
   */
  getSlowestEndpoints(limit: number = 5) {
    const now = Date.now();
    const validMetrics = this.metrics.filter(m => now - m.timestamp < this.WINDOW_SIZE_MS && m.endpoint);

    const endpoints: { [key: string]: { count: number; avgLatency: number; p95: number } } = {};

    validMetrics.forEach(m => {
      if (!endpoints[m.endpoint!]) {
        endpoints[m.endpoint!] = { count: 0, avgLatency: 0, p95: 0 };
      }
      endpoints[m.endpoint!].count++;
      endpoints[m.endpoint!].avgLatency += m.latencyMs;
    });

    // Calculate averages and p95
    Object.values(endpoints).forEach(ep => {
      ep.avgLatency = ep.avgLatency / ep.count;
    });

    // Get p95 for each endpoint
    const endpointLatencies: { [key: string]: number[] } = {};
    validMetrics.forEach(m => {
      if (m.endpoint) {
        if (!endpointLatencies[m.endpoint]) {
          endpointLatencies[m.endpoint] = [];
        }
        endpointLatencies[m.endpoint].push(m.latencyMs);
      }
    });

    Object.entries(endpointLatencies).forEach(([endpoint, latencies]) => {
      endpoints[endpoint].p95 = this.percentile(latencies, 0.95);
    });

    return Object.entries(endpoints)
      .sort(([, a], [, b]) => b.p95 - a.p95)
      .slice(0, limit)
      .map(([endpoint, stats]) => ({ endpoint, ...stats }));
  }

  /**
   * Check if we're in a degraded state
   */
  isDegraded(): boolean {
    const metrics = this.getHistoricalMetrics();
    return metrics.errorRate > 0.05 || metrics.p95 > 500;
  }

  /**
   * Reset metrics (for testing)
   */
  reset() {
    this.metrics = [];
  }

  /**
   * Get current metrics count (for monitoring)
   */
  getMetricsCount(): number {
    return this.metrics.length;
  }

  /**
   * Private helper: calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)] || 0;
  }

  /**
   * Private helper: cleanup old metrics
   */
  private cleanup() {
    const now = Date.now();
    const newMetrics = this.metrics.filter(m => now - m.timestamp < this.WINDOW_SIZE_MS);

    // If we exceed max, keep only recent ones
    if (newMetrics.length > this.MAX_METRICS) {
      this.metrics = newMetrics.slice(-this.MAX_METRICS);
    } else {
      this.metrics = newMetrics;
    }

    if (this.metrics.length > this.MAX_METRICS * 0.9) {
      logger.warn({
        msg: "metrics_history_approaching_limit",
        count: this.metrics.length,
        limit: this.MAX_METRICS
      });
    }
  }
}

export const metricsHistory = new MetricsHistoryService();
