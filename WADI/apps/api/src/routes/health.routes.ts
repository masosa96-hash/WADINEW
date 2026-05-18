import { Router, Request, Response } from "express";
import { performHealthCheck, performLivenessCheck, performReadinessCheck } from "../services/health.service";
import { logger } from "../core/logger";

const healthRouter = Router();

/**
 * GET /health
 * Readiness probe - verifica si el servicio está listo para recibir traffic
 * Usado por: Kubernetes, Render, Railway, Load Balancers
 */
healthRouter.get("/health", async (req: Request, res: Response) => {
  try {
    const result = await performHealthCheck();

    const statusCode = result.status === "healthy" ? 200 : 
                       result.status === "degraded" ? 200 :
                       503;

    res.status(statusCode).json({
      status: result.status,
      message: "WADI API " + (result.status === "healthy" ? "ONLINE" : "DEGRADED"),
      timestamp: result.timestamp,
      checks: result.checks,
    });
  } catch (err) {
    logger.error("Health check error", { error: (err as Error).message });
    res.status(503).json({
      status: "unhealthy",
      message: "Health check failed",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/live (Liveness Probe)
 * Rápido, sin I/O externo. Render mata el contenedor si retorna 5xx
 * Usado por: Container orchestrators para detectar procesos zombie
 */
healthRouter.get("/health/live", (req: Request, res: Response) => {
  const result = performLivenessCheck();
  res.status(200).json(result);
});

/**
 * GET /health/ready (Readiness Probe)
 * Verifica si el servicio está listo para recibir traffic
 * Usado por: Load balancers para routing de traffic
 */
healthRouter.get("/health/ready", async (req: Request, res: Response) => {
  try {
    const result = await performReadinessCheck();
    const statusCode = result.ready ? 200 : 503;

    res.status(statusCode).json({
      ready: result.ready,
      timestamp: result.timestamp,
    });
  } catch (err) {
    logger.error("Readiness check error", { error: (err as Error).message });
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/health
 * Alias para compatibilidad con frontend (que espera /api/health)
 */
healthRouter.get("/api/health", async (req: Request, res: Response) => {
  try {
    const result = await performHealthCheck();
    res.status(200).json({
      status: "WADI ONLINE (API Alias)",
      health: result.status,
      version: "5.1.0",
      timestamp: result.timestamp,
    });
  } catch (err) {
    logger.error("API health alias error", { error: (err as Error).message });
    res.status(503).json({
      status: "WADI OFFLINE",
      error: (err as Error).message,
    });
  }
});

export default healthRouter;
