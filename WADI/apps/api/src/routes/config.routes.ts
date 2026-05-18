import { Router, Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";
import { webhookAlerts } from "../services/webhook-alerts.service";
import { emailAlerts } from "../services/email-alerts.service";
import { sentryAlerts } from "../services/sentry-alerts.service";

const router = Router();

/**
 * Configuration store for dynamic thresholds
 */
class AlertThresholds {
  private thresholds = {
    errorRateWarning: 0.05, // 5%
    errorRateCritical: 0.10, // 10%
    latencyP95Warning: 500, // ms
    latencyP99Critical: 2000, // ms
    serverErrorRateCritical: 0.02, // 2%
    dbConnectivityFailureThreshold: 5 // consecutive 503s
  };

  getAll() {
    return { ...this.thresholds };
  }

  update(newThresholds: Partial<typeof this.thresholds>) {
    Object.assign(this.thresholds, newThresholds);
  }

  get(key: keyof typeof this.thresholds) {
    return this.thresholds[key];
  }
}

const thresholds = new AlertThresholds();

/**
 * GET /config/alerts/thresholds
 * Get current alert thresholds
 */
router.get("/alerts/thresholds", (req: Request, res: Response) => {
  res.json({
    timestamp: Date.now(),
    thresholds: thresholds.getAll()
  });
});

/**
 * PATCH /config/alerts/thresholds
 * Update alert thresholds
 */
router.patch("/alerts/thresholds", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { errorRateWarning, errorRateCritical, latencyP95Warning, latencyP99Critical, ...rest } = req.body;

    // Validate thresholds
    const updates: Record<string, number> = {};

    if (errorRateWarning !== undefined) {
      if (typeof errorRateWarning !== "number" || errorRateWarning <= 0 || errorRateWarning > 1) {
        throw new AppError("VALIDATION_ERROR", "errorRateWarning must be between 0 and 1", 400);
      }
      updates.errorRateWarning = errorRateWarning;
    }

    if (errorRateCritical !== undefined) {
      if (typeof errorRateCritical !== "number" || errorRateCritical <= 0 || errorRateCritical > 1) {
        throw new AppError("VALIDATION_ERROR", "errorRateCritical must be between 0 and 1", 400);
      }
      updates.errorRateCritical = errorRateCritical;
    }

    if (latencyP95Warning !== undefined) {
      if (typeof latencyP95Warning !== "number" || latencyP95Warning <= 0) {
        throw new AppError("VALIDATION_ERROR", "latencyP95Warning must be > 0", 400);
      }
      updates.latencyP95Warning = latencyP95Warning;
    }

    if (latencyP99Critical !== undefined) {
      if (typeof latencyP99Critical !== "number" || latencyP99Critical <= 0) {
        throw new AppError("VALIDATION_ERROR", "latencyP99Critical must be > 0", 400);
      }
      updates.latencyP99Critical = latencyP99Critical;
    }

    thresholds.update(updates);

    res.json({
      timestamp: Date.now(),
      updated: Object.keys(updates),
      thresholds: thresholds.getAll()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /config/webhooks
 * Get all registered webhooks
 */
router.get("/webhooks", (req: Request, res: Response) => {
  res.json({
    timestamp: Date.now(),
    webhooks: webhookAlerts.getEndpoints()
  });
});

/**
 * POST /config/webhooks
 * Register a new webhook
 */
router.post("/webhooks", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, url, timeout, enabled, headers } = req.body;

    if (!name || !url) {
      throw new AppError("VALIDATION_ERROR", "name and url are required", 400);
    }

    if (!url.match(/^https?:\/\//)) {
      throw new AppError("VALIDATION_ERROR", "url must be a valid HTTP(S) URL", 400);
    }

    webhookAlerts.registerEndpoint(name, url, {
      timeout: timeout || 5000,
      enabled: enabled !== false,
      headers
    });

    res.status(201).json({
      timestamp: Date.now(),
      message: `Webhook '${name}' registered`,
      status: webhookAlerts.getEndpointStatus(name)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /config/webhooks/:name
 * Unregister a webhook
 */
router.delete("/webhooks/:name", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params;

    if (!name) {
      throw new AppError("VALIDATION_ERROR", "Webhook name is required", 400);
    }

    webhookAlerts.unregisterEndpoint(name);

    res.json({
      timestamp: Date.now(),
      message: `Webhook '${name}' unregistered`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /config/webhooks/:name/health
 * Get webhook status
 */
router.get("/webhooks/:name/health", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params;
    const status = webhookAlerts.getEndpointStatus(name);

    if (!status) {
      throw new AppError("NOT_FOUND", `Webhook '${name}' not found`, 404);
    }

    res.json({
      timestamp: Date.now(),
      ...status
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /config/notifications/email
 * Get email notification status
 */
router.get("/notifications/email", (req: Request, res: Response) => {
  res.json({
    timestamp: Date.now(),
    email: emailAlerts.getStatus()
  });
});

/**
 * PATCH /config/notifications/email
 * Update email recipients
 */
router.patch("/notifications/email", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recipients } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new AppError("VALIDATION_ERROR", "recipients must be a non-empty array", 400);
    }

    emailAlerts.setRecipients(recipients);

    res.json({
      timestamp: Date.now(),
      message: "Email recipients updated",
      email: emailAlerts.getStatus()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /config/integrations
 * Get status of all notification integrations
 */
router.get("/integrations", (req: Request, res: Response) => {
  res.json({
    timestamp: Date.now(),
    integrations: {
      webhooks: webhookAlerts.getHealth(),
      email: emailAlerts.getStatus(),
      sentry: sentryAlerts.getStatus()
    }
  });
});

export default router;
