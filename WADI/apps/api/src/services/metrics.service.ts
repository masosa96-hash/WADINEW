import { EventEmitter } from "events";
import { logger } from "../core/logger";
import { supabase } from "../supabase";
import { eventBus } from "../core/event-bus";
import type { BuildStatus } from "../types/domain";

// ─── Legacy metric enum (kept for backward compatibility) ──────────────────────
export enum MetricEvent {
  BREAKER_TRANSITION = "breaker_transition",
  TOKEN_USAGE = "token_usage",
  PROJECT_CRYSTALLIZED = "project_crystallized",
  COGNITIVE_ADJUSTMENT = "cognitive_adjustment",
  CHAT_STREAM_ERROR = "chat_stream_error",
}

// ─── Token pricing model (per 1M tokens) ──────────────────────────────────────
const TOKEN_PRICE_USD: Record<string, { input: number; output: number }> = {
  "gpt-4o":        { input: 2.50,  output: 10.00 },
  "gpt-4o-mini":   { input: 0.15,  output: 0.60 },
  "gpt-4-turbo":   { input: 10.00, output: 30.00 },
  "llama3-70b":    { input: 0.59,  output: 0.79 },  // Groq
  "llama3-8b":     { input: 0.05,  output: 0.08 },
  "default":       { input: 1.00,  output: 3.00 },
};

function estimateCostUSD(model: string, promptTokens: number, completionTokens: number): number {
  const price = TOKEN_PRICE_USD[model] ?? TOKEN_PRICE_USD["default"];
  return (promptTokens / 1_000_000) * price.input + (completionTokens / 1_000_000) * price.output;
}

// ─── In-memory counters (lightweight, no DB overhead for hot path) ─────────────
const runTimestamps: Map<string, number> = new Map(); // correlationId → start_ms
const buildStatusCounts: Record<BuildStatus, number> = { OK: 0, WARN: 0, ERROR: 0, RISK: 0 };
let deployAttempts = 0;
let deployFailures = 0;

// ─── MetricsService ────────────────────────────────────────────────────────────

class MetricsService extends EventEmitter {
  constructor() {
    super();
    this.setupLegacyListeners();
    this.subscribeToEventBus();
  }

  // ── Legacy listeners (backward compat) ──────────────────────────────────────

  private setupLegacyListeners() {
    this.on(MetricEvent.BREAKER_TRANSITION, async (data) => {
      logger.info({ msg: "metric_captured", event: MetricEvent.BREAKER_TRANSITION, ...data });
      try {
        await (supabase as any).from("breaker_metrics").insert({
          breaker_name: data.name,
          from_state: data.from,
          to_state: data.to
        });
      } catch (e: any) {
        logger.error({ msg: "failed_to_persist_breaker_metric", error: e.message });
      }
    });

    this.on(MetricEvent.TOKEN_USAGE, async (data) => {
      logger.info({ msg: "metric_captured", event: MetricEvent.TOKEN_USAGE, ...data });
      const costUSD = estimateCostUSD(
        data.model ?? "default",
        data.tokens?.prompt_tokens ?? 0,
        data.tokens?.completion_tokens ?? 0
      );
      try {
        await (supabase as any).from("token_usage").insert({
          project_id: data.projectId,
          user_id: data.userId,
          provider: data.provider,
          model: data.model || "unknown",
          prompt_tokens: data.tokens.prompt_tokens,
          completion_tokens: data.tokens.completion_tokens,
          total_tokens: data.tokens.total_tokens,
          cost_usd: costUSD
        });
      } catch (e: any) {
        logger.error({ msg: "failed_to_persist_token_metric", error: e.message });
      }
    });

    this.on(MetricEvent.PROJECT_CRYSTALLIZED, async (data) => {
      logger.info({ msg: "metric_captured", event: MetricEvent.PROJECT_CRYSTALLIZED, ...data });
      const costUSD = estimateCostUSD(
        data.model ?? "default",
        data.tokens?.prompt_tokens ?? 0,
        data.tokens?.completion_tokens ?? 0
      );
      try {
        if (data.projectId) {
          await (supabase as any).from("projects")
            .update({ conversion_time_ms: data.durationMs })
            .eq("id", data.projectId);
        }
        await (supabase as any).from("token_usage").insert({
          project_id: data.projectId,
          provider: data.provider,
          model: data.model,
          prompt_tokens: data.tokens?.prompt_tokens,
          completion_tokens: data.tokens?.completion_tokens,
          total_tokens: data.tokens?.total_tokens,
          cost_usd: costUSD
        });
      } catch (e: any) {
        logger.error({ msg: "failed_to_persist_crystallized_metric", error: e.message });
      }
    });

    this.on(MetricEvent.COGNITIVE_ADJUSTMENT, async (data) => {
      logger.info({ msg: "metric_captured", event: MetricEvent.COGNITIVE_ADJUSTMENT, ...data });
      try {
        await (supabase as any).from("cognitive_metrics").insert({
          user_id: data.userId,
          bias_detected: data.biasDetected,
          confidence_score: data.confidenceScore,
          adjustment_applied: data.adjustmentApplied
        });
      } catch (e: any) {
        logger.error({ msg: "failed_to_persist_cognitive_metric", error: e.message });
      }
    });
  }

  // ── Event Bus subscriptions (new in Phase 16) ────────────────────────────────

  private subscribeToEventBus() {
    // Track run start time for duration measurement
    eventBus.on("SCAFFOLDING_COMPLETE", ({ projectId, correlationId }) => {
      if (!runTimestamps.has(correlationId)) {
        runTimestamps.set(correlationId, Date.now());
      }
    });

    // Build status breakdown
    eventBus.on("BUILD_VERIFIED", ({ projectId, correlationId, result }) => {
      buildStatusCounts[result.status]++;
      logger.info({
        msg: "metric_build_verified",
        projectId,
        correlationId,
        buildStatus: result.status,
        buildStatusTotals: { ...buildStatusCounts }
      });
    });

    // Deploy attempt tracking
    eventBus.on("DEPLOYMENT_COMPLETE", ({ projectId, correlationId, result }) => {
      deployAttempts++;
      if (!result.success) {
        deployFailures++;
        logger.warn({
          msg: "metric_deploy_failed",
          projectId,
          correlationId,
          failureRate: this.deployFailureRate(),
          error: result.error
        });
      } else {
        logger.info({
          msg: "metric_deploy_success",
          projectId,
          correlationId,
          url: result.url,
          failureRate: this.deployFailureRate()
        });
      }

      // Persist deploy result
      this.persistDeployMetric(projectId, correlationId, result).catch(() => {});
    });

    // Materialization duration + cost summary
    eventBus.on("MATERIALIZATION_COMPLETE", ({ projectId, correlationId, success, filesCreated }) => {
      const startMs = runTimestamps.get(correlationId);
      const durationMs = startMs ? Date.now() - startMs : undefined;
      runTimestamps.delete(correlationId);

      logger.info({
        msg: "metric_materialization_complete",
        projectId,
        correlationId,
        success,
        filesCreated,
        durationMs,
        buildStatusTotals: { ...buildStatusCounts },
        deployFailureRate: this.deployFailureRate()
      });

      // Persist run summary
      this.persistRunMetric(projectId, correlationId, success, filesCreated, durationMs).catch(() => {});
    });

    // Run failures
    eventBus.on("RUN_FAILED", ({ projectId, correlationId, step, error }) => {
      logger.error({ msg: "metric_run_failed", projectId, correlationId, step, error });
    });
  }

  // ── Derived metrics ──────────────────────────────────────────────────────────

  deployFailureRate(): number {
    if (deployAttempts === 0) return 0;
    return Math.round((deployFailures / deployAttempts) * 100);
  }

  buildStatusSummary(): Record<BuildStatus, number> {
    return { ...buildStatusCounts };
  }

  // ── Persistence helpers ──────────────────────────────────────────────────────

  private async persistDeployMetric(
    projectId: string,
    correlationId: string,
    result: { success: boolean; url?: string; error?: string; provider: string }
  ) {
    try {
      await (supabase as any).from("deploy_metrics").insert({
        project_id: projectId,
        correlation_id: correlationId,
        provider: result.provider,
        success: result.success,
        url: result.url,
        error: result.error,
        created_at: new Date().toISOString()
      });
    } catch {
      // Non-critical: metrics should never crash the main flow
    }
  }

  private async persistRunMetric(
    projectId: string,
    correlationId: string,
    success: boolean,
    filesCreated: number,
    durationMs?: number
  ) {
    try {
      await (supabase as any).from("run_metrics").insert({
        project_id: projectId,
        correlation_id: correlationId,
        success,
        files_created: filesCreated,
        duration_ms: durationMs,
        created_at: new Date().toISOString()
      });
    } catch {
      // Non-critical
    }
  }

  // ── Public emit (legacy API) ─────────────────────────────────────────────────

  emitMetric(event: MetricEvent, data: Record<string, unknown>) {
    this.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}

export const metricsService = new MetricsService();
