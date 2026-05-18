import * as Sentry from "@sentry/node";
import { logger } from "../core/logger";
import { Alert, AlertLevel } from "./alerting.service";

/**
 * Sentry Alerts Service
 * Logs critical alerts to Sentry with context and breadcrumbs
 */
class SentryAlertsService {
  private readonly isEnabled: boolean;

  constructor() {
    this.isEnabled = !!process.env.SENTRY_DSN;
  }

  /**
   * Log alert to Sentry
   */
  logAlert(alert: Alert) {
    if (!this.isEnabled) {
      return;
    }

    try {
      // Only log critical alerts to avoid noise
      if (alert.level === AlertLevel.CRITICAL) {
        const level = "error" as const;

        Sentry.captureMessage(alert.message, level);

        // Add context to the scope
        Sentry.withScope(scope => {
          scope.setTag("alert_rule", alert.rule);
          scope.setTag("alert_id", alert.id);
          scope.setLevel(level);

          // Add metrics as context
          if (alert.metrics) {
            scope.setContext("metrics", alert.metrics);
          }

          // Add breadcrumb for tracking alert history
          Sentry.addBreadcrumb({
            category: "alert",
            level: "warning",
            message: `Alert: ${alert.rule}`,
            data: {
              rule: alert.rule,
              message: alert.message,
              timestamp: alert.timestamp
            }
          });

          logger.info({
            msg: "sentry_alert_logged",
            rule: alert.rule,
            level: alert.level
          });
        });
      }
    } catch (error: any) {
      logger.error({
        msg: "sentry_alert_logging_failed",
        error: error.message
      });
    }
  }

  /**
   * Log alert resolution
   */
  logAlertResolution(alert: Alert) {
    if (!this.isEnabled || !alert.resolvedAt) {
      return;
    }

    try {
      const duration = alert.resolvedAt - alert.timestamp;

      Sentry.addBreadcrumb({
        category: "alert-resolved",
        level: "info",
        message: `Alert Resolved: ${alert.rule}`,
        data: {
          rule: alert.rule,
          duration: `${duration}ms`,
          resolvedAt: alert.resolvedAt
        }
      });

      logger.info({
        msg: "sentry_alert_resolved_logged",
        rule: alert.rule,
        duration
      });
    } catch (error: any) {
      logger.error({
        msg: "sentry_resolution_logging_failed",
        error: error.message
      });
    }
  }

  /**
   * Add alert to breadcrumb trail
   */
  addAlertBreadcrumb(alert: Alert) {
    if (!this.isEnabled) {
      return;
    }

    Sentry.addBreadcrumb({
      category: "monitoring",
      level: alert.level === AlertLevel.CRITICAL ? "error" : "warning",
      message: alert.message,
      timestamp: Math.floor(alert.timestamp / 1000),
      data: {
        rule: alert.rule,
        level: alert.level
      }
    });
  }

  /**
   * Capture alert context for debugging
   */
  captureAlertContext(alert: Alert, additionalContext?: Record<string, any>) {
    if (!this.isEnabled) {
      return;
    }

    Sentry.withScope(scope => {
      scope.setContext("alert", {
        id: alert.id,
        rule: alert.rule,
        level: alert.level,
        message: alert.message,
        timestamp: alert.timestamp,
        ...additionalContext
      });

      if (alert.metrics) {
        scope.setContext("alert_metrics", alert.metrics);
      }

      logger.info({
        msg: "sentry_context_captured",
        rule: alert.rule
      });
    });
  }

  /**
   * Check if Sentry is enabled
   */
  isEnabled_(): boolean {
    return this.isEnabled;
  }

  /**
   * Get Sentry status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      dsn: this.isEnabled ? "***configured***" : "not_configured"
    };
  }
}

export const sentryAlerts = new SentryAlertsService();
