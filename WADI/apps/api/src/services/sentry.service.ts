import * as Sentry from "@sentry/node";
import { RequestHandler, ErrorRequestHandler } from "express";
import { logger } from "../core/logger";

const isEnabled = Boolean(process.env.SENTRY_DSN);

export function initSentry(): void {
  if (!isEnabled) {
    logger.info({ msg: "sentry_disabled", reason: "SENTRY_DSN not configured" });
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    release: process.env.RELEASE || undefined,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.05"),
    integrations: Sentry.httpIntegration ? [Sentry.httpIntegration()] : [],
    beforeSend(event) {
      if (event?.level === "fatal" || event?.level === "error") {
        return event;
      }
      return event;
    },
  });

  logger.info({ msg: "sentry_initialized", environment: process.env.NODE_ENV });
}

export function sentryRequestHandler(): RequestHandler {
  return (_req, _res, next) => next();
}

export function sentryTracingHandler(): RequestHandler {
  return (_req, _res, next) => next();
}

export function sentryErrorHandler(): ErrorRequestHandler {
  return isEnabled && typeof Sentry.expressErrorHandler === "function"
    ? Sentry.expressErrorHandler()
    : (_err, _req, _res, next) => next(_err);
}

export function captureException(error: unknown): void {
  if (!isEnabled) return;
  Sentry.captureException(error);
}
