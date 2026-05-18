import { supabase } from "../supabase";
import { logger } from "../core/logger";

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    api: "ok" | "error";
    database: "ok" | "error";
    environment: "ok" | "error";
  };
  details?: Record<string, any>;
}

const startTime = Date.now();

/**
 * Realiza un health check completo del sistema
 * Verifica:
 * - API responsiva
 * - Conexión a BD (Supabase)
 * - Variables de entorno críticas
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const checks: HealthCheckResult["checks"] = {
    api: "ok",
    database: "ok",
    environment: "ok",
  };

  const details: Record<string, any> = {
    apiVersion: "5.1.0",
  };

  // Check 1: Base de Datos
  try {
    // Ejecutar una query simple para verificar conectividad
    const { data, error } = await supabase
      .from("_prisma_migrations")
      .select("id")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows, but connection OK
      checks.database = "error";
      details.databaseError = error.message;
      logger.warn("Database health check failed", { error: error.message });
    } else {
      details.databaseLatency = `${Date.now() - startTime}ms`;
    }
  } catch (err) {
    checks.database = "error";
    details.databaseError = (err as Error).message;
    logger.error("Database health check exception", { error: (err as Error).message });
  }

  // Check 2: Variables de Entorno
  const requiredEnvVars = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "GROQ_API_KEY",
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (key) => !process.env[key]
  );

  if (missingEnvVars.length > 0) {
    checks.environment = "error";
    details.missingEnvVars = missingEnvVars;
    logger.warn("Missing environment variables", { vars: missingEnvVars });
  }

  // Determinar estado general
  const failedChecks = Object.values(checks).filter((c) => c === "error").length;
  const status =
    failedChecks === 0
      ? ("healthy" as const)
      : failedChecks === 1
        ? ("degraded" as const)
        : ("unhealthy" as const);

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    checks,
    details,
  };
}

/**
 * Lightweight liveness check (rápido, sin I/O externo)
 * Usado por Render/Railway para determinar si matar el contenedor
 */
export function performLivenessCheck(): { alive: boolean; timestamp: string } {
  return {
    alive: true,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Readiness check (verifica si el servicio está listo para traffic)
 */
export async function performReadinessCheck(): Promise<{
  ready: boolean;
  timestamp: string;
}> {
  try {
    const health = await performHealthCheck();
    return {
      ready: health.status !== "unhealthy",
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    logger.error("Readiness check failed", { error: (err as Error).message });
    return {
      ready: false,
      timestamp: new Date().toISOString(),
    };
  }
}
