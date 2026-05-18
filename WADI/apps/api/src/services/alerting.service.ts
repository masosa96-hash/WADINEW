import { logger } from "../core/logger";
import { metricsHistory } from "./metrics-history.service";

export enum AlertLevel {
  INFO = "info",
  WARNING = "warning",
  CRITICAL = "critical"
}

export interface Alert {
  id: string;
  level: AlertLevel;
  rule: string;
  message: string;
  timestamp: number;
  metrics?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: number;
}

interface AlertRule {
  name: string;
  level: AlertLevel;
  condition: () => boolean;
  message: (metrics: any) => string;
}

/**
 * Alert Rules Engine
 * Evaluates system health and triggers alerts based on thresholds
 */
class AlertingService {
  private activeAlerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private readonly MAX_ALERT_HISTORY = 1000;

  private rules: AlertRule[] = [
    {
      name: "HIGH_ERROR_RATE",
      level: AlertLevel.WARNING,
      condition: () => {
        const metrics = metricsHistory.getHistoricalMetrics();
        return metrics.errorRate > 0.05; // 5% error rate
      },
      message: (metrics) => `High error rate detected: ${(metrics.errorRate * 100).toFixed(2)}%`
    },
    {
      name: "CRITICAL_ERROR_RATE",
      level: AlertLevel.CRITICAL,
      condition: () => {
        const metrics = metricsHistory.getHistoricalMetrics();
        return metrics.errorRate > 0.10; // 10% error rate
      },
      message: (metrics) => `Critical error rate: ${(metrics.errorRate * 100).toFixed(2)}%`
    },
    {
      name: "HIGH_LATENCY_P95",
      level: AlertLevel.WARNING,
      condition: () => {
        const metrics = metricsHistory.getHistoricalMetrics();
        return metrics.p95 > 500; // 500ms p95
      },
      message: (metrics) => `High latency detected: P95=${metrics.p95}ms`
    },
    {
      name: "CRITICAL_LATENCY_P99",
      level: AlertLevel.CRITICAL,
      condition: () => {
        const metrics = metricsHistory.getHistoricalMetrics();
        return metrics.p99 > 2000; // 2s p99
      },
      message: (metrics) => `Critical latency: P99=${metrics.p99}ms`
    },
    {
      name: "NO_REQUESTS",
      level: AlertLevel.WARNING,
      condition: () => {
        const metrics = metricsHistory.getHistoricalMetrics();
        return metrics.totalRequests === 0;
      },
      message: () => "No requests received in the last hour"
    },
    {
      name: "HIGH_SERVER_ERROR_RATE",
      level: AlertLevel.CRITICAL,
      condition: () => {
        const breakdown = metricsHistory.getStatusCodeBreakdown();
        const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
        const serverErrors = (breakdown[500] || 0) + (breakdown[502] || 0) + (breakdown[503] || 0) + (breakdown[504] || 0);
        return total > 0 && serverErrors / total > 0.02; // 2% server errors
      },
      message: (metrics) => {
        const breakdown = metricsHistory.getStatusCodeBreakdown();
        const serverErrors = (breakdown[500] || 0) + (breakdown[502] || 0) + (breakdown[503] || 0) + (breakdown[504] || 0);
        return `High server error rate: ${serverErrors} 5xx errors`;
      }
    },
    {
      name: "DATABASE_CONNECTIVITY",
      level: AlertLevel.CRITICAL,
      condition: () => {
        const breakdown = metricsHistory.getStatusCodeBreakdown();
        const dbErrors = breakdown[503] || 0; // Service Unavailable
        return dbErrors > 5;
      },
      message: () => "Potential database connectivity issues detected"
    }
  ];

  /**
   * Evaluate all alert rules
   */
  evaluateRules() {
    const metrics = metricsHistory.getHistoricalMetrics();

    this.rules.forEach(rule => {
      try {
        const triggered = rule.condition();
        const ruleId = rule.name;

        if (triggered) {
          if (!this.activeAlerts.has(ruleId)) {
            const alert: Alert = {
              id: `${rule.name}-${Date.now()}`,
              level: rule.level,
              rule: rule.name,
              message: rule.message(metrics),
              timestamp: Date.now(),
              metrics: metrics
            };

            this.activeAlerts.set(ruleId, alert);
            this.alertHistory.push(alert);
            this.cleanup();

            logger.warn({
              msg: "alert_triggered",
              alert: alert.rule,
              level: alert.level,
              message: alert.message
            });
          }
        } else {
          // Clear resolved alert
          if (this.activeAlerts.has(ruleId)) {
            const alert = this.activeAlerts.get(ruleId)!;
            alert.resolved = true;
            alert.resolvedAt = Date.now();
            this.activeAlerts.delete(ruleId);

            logger.info({
              msg: "alert_resolved",
              alert: alert.rule,
              duration: alert.resolvedAt - alert.timestamp
            });
          }
        }
      } catch (error: any) {
        logger.error({
          msg: "alert_evaluation_error",
          rule: rule.name,
          error: error.message
        });
      }
    });
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alerts by level
   */
  getAlertsByLevel(level: AlertLevel): Alert[] {
    return this.getActiveAlerts().filter(a => a.level === level);
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 50): Alert[] {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Get alert summary
   */
  getAlertSummary() {
    const active = this.getActiveAlerts();
    return {
      total: active.length,
      critical: active.filter(a => a.level === AlertLevel.CRITICAL).length,
      warning: active.filter(a => a.level === AlertLevel.WARNING).length,
      alerts: active
    };
  }

  /**
   * Check if system is in healthy state
   */
  isHealthy(): boolean {
    const critical = this.getAlertsByLevel(AlertLevel.CRITICAL);
    return critical.length === 0;
  }

  /**
   * Get health status with breakdown
   */
  getHealthStatus() {
    const metrics = metricsHistory.getHistoricalMetrics();
    const alerts = this.getActiveAlerts();
    const critical = alerts.filter(a => a.level === AlertLevel.CRITICAL);
    const warnings = alerts.filter(a => a.level === AlertLevel.WARNING);

    return {
      status: critical.length > 0 ? "degraded" : warnings.length > 0 ? "warning" : "healthy",
      metrics: {
        errorRate: (metrics.errorRate * 100).toFixed(2) + "%",
        p95: metrics.p95 + "ms",
        p99: metrics.p99 + "ms",
        totalRequests: metrics.totalRequests
      },
      alerts: {
        critical: critical.length,
        warning: warnings.length,
        total: alerts.length
      }
    };
  }

  /**
   * Reset (for testing)
   */
  reset() {
    this.activeAlerts.clear();
    this.alertHistory = [];
  }

  /**
   * Private: cleanup old alerts
   */
  private cleanup() {
    if (this.alertHistory.length > this.MAX_ALERT_HISTORY) {
      this.alertHistory = this.alertHistory.slice(-this.MAX_ALERT_HISTORY);
    }
  }
}

export const alerting = new AlertingService();
