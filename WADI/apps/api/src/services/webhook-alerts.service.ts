import { logger } from "../core/logger";
import { Alert, AlertLevel } from "./alerting.service";

interface WebhookEndpoint {
  url: string;
  enabled: boolean;
  retryCount: number;
  timeout: number;
  headers?: Record<string, string>;
}

interface WebhookPayload {
  timestamp: number;
  alert: Alert;
  severity: string;
  action: "triggered" | "resolved";
}

/**
 * Webhook Alert Service
 * Sends alerts to external systems via HTTP POST with retry logic
 */
class WebhookAlertsService {
  private endpoints: Map<string, WebhookEndpoint> = new Map();
  private failureCount: Map<string, number> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly BACKOFF_MS = 1000; // Start with 1s, exponential backoff

  /**
   * Register a webhook endpoint
   */
  registerEndpoint(
    name: string,
    url: string,
    options?: {
      enabled?: boolean;
      timeout?: number;
      headers?: Record<string, string>;
    }
  ) {
    this.endpoints.set(name, {
      url,
      enabled: options?.enabled ?? true,
      retryCount: 0,
      timeout: options?.timeout ?? 5000,
      headers: options?.headers
    });

    logger.info({
      msg: "webhook_registered",
      name,
      url
    });
  }

  /**
   * Unregister a webhook endpoint
   */
  unregisterEndpoint(name: string) {
    this.endpoints.delete(name);
    this.failureCount.delete(name);

    logger.info({
      msg: "webhook_unregistered",
      name
    });
  }

  /**
   * Send alert to all registered webhooks
   */
  async sendAlert(alert: Alert, action: "triggered" | "resolved") {
    const payload: WebhookPayload = {
      timestamp: Date.now(),
      alert,
      severity: alert.level,
      action
    };

    const promises = Array.from(this.endpoints.entries()).map(([name, endpoint]) =>
      this.sendToEndpoint(name, endpoint, payload)
    );

    await Promise.all(promises).catch(err => {
      logger.error({
        msg: "webhook_batch_error",
        error: err.message
      });
    });
  }

  /**
   * Send to a single endpoint with retry logic
   */
  private async sendToEndpoint(
    name: string,
    endpoint: WebhookEndpoint,
    payload: WebhookPayload,
    retryCount: number = 0
  ): Promise<void> {
    if (!endpoint.enabled) {
      return;
    }

    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "WADI-AlertSystem/1.0",
          ...endpoint.headers
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(endpoint.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Success - reset failure count
      this.failureCount.delete(name);

      logger.info({
        msg: "webhook_sent",
        endpoint: name,
        alertRule: payload.alert.rule,
        statusCode: response.status
      });
    } catch (error: any) {
      const failures = (this.failureCount.get(name) || 0) + 1;
      this.failureCount.set(name, failures);

      logger.warn({
        msg: "webhook_send_failed",
        endpoint: name,
        attempt: retryCount + 1,
        maxRetries: this.MAX_RETRIES,
        error: error.message
      });

      // Retry with exponential backoff
      if (retryCount < this.MAX_RETRIES) {
        const backoffDelay = this.BACKOFF_MS * Math.pow(2, retryCount);

        setTimeout(() => {
          this.sendToEndpoint(name, endpoint, payload, retryCount + 1);
        }, backoffDelay);
      } else {
        // Give up after max retries
        logger.error({
          msg: "webhook_max_retries_exceeded",
          endpoint: name,
          alertRule: payload.alert.rule
        });

        // Disable endpoint if too many failures
        if (failures > 10) {
          endpoint.enabled = false;
          logger.warn({
            msg: "webhook_disabled_too_many_failures",
            endpoint: name
          });
        }
      }
    }
  }

  /**
   * Get all registered endpoints
   */
  getEndpoints() {
    return Array.from(this.endpoints.entries()).map(([name, endpoint]) => ({
      name,
      ...endpoint,
      failures: this.failureCount.get(name) || 0
    }));
  }

  /**
   * Get endpoint status
   */
  getEndpointStatus(name: string) {
    const endpoint = this.endpoints.get(name);
    if (!endpoint) {
      return null;
    }

    return {
      name,
      enabled: endpoint.enabled,
      url: endpoint.url,
      failures: this.failureCount.get(name) || 0,
      healthy: (this.failureCount.get(name) || 0) < 5
    };
  }

  /**
   * Reset failure count for an endpoint
   */
  resetFailures(name: string) {
    this.failureCount.delete(name);
    logger.info({
      msg: "webhook_failures_reset",
      endpoint: name
    });
  }

  /**
   * Enable/disable endpoint
   */
  setEndpointEnabled(name: string, enabled: boolean) {
    const endpoint = this.endpoints.get(name);
    if (endpoint) {
      endpoint.enabled = enabled;
      logger.info({
        msg: "webhook_enabled_changed",
        endpoint: name,
        enabled
      });
    }
  }

  /**
   * Get webhook health
   */
  getHealth() {
    const endpoints = Array.from(this.endpoints.entries());
    const healthy = endpoints.filter(([, ep]) => ep.enabled && (this.failureCount.get(endpoints.indexOf([, ep])) || 0) < 5).length;

    return {
      total: endpoints.length,
      healthy,
      degraded: endpoints.length - healthy
    };
  }
}

export const webhookAlerts = new WebhookAlertsService();
