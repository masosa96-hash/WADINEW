import { EventEmitter } from "events";
import { logger } from "../core/logger";
import { supabase } from "../supabase";

export enum MetricEvent {
  BREAKER_TRANSITION = "breaker_transition",
  TOKEN_USAGE = "token_usage",
  PROJECT_CRYSTALLIZED = "project_crystallized",
  COGNITIVE_ADJUSTMENT = "cognitive_adjustment",
  CHAT_STREAM_ERROR = "chat_stream_error",
}

class MetricsService extends EventEmitter {
  constructor() {
    super();
    this.setupDefaultListeners();
  }

  private setupDefaultListeners() {
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
      try {
        await (supabase as any).from("token_usage").insert({
          project_id: data.projectId,
          user_id: data.userId,
          provider: data.provider,
          model: data.model || "unknown",
          prompt_tokens: data.tokens.prompt_tokens,
          completion_tokens: data.tokens.completion_tokens,
          total_tokens: data.tokens.total_tokens
        });
      } catch (e: any) {
        logger.error({ msg: "failed_to_persist_token_metric", error: e.message });
      }
    });

    this.on(MetricEvent.PROJECT_CRYSTALLIZED, async (data) => {
      logger.info({ msg: "metric_captured", event: MetricEvent.PROJECT_CRYSTALLIZED, ...data });
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
          prompt_tokens: data.tokens.prompt_tokens,
          completion_tokens: data.tokens.completion_tokens,
          total_tokens: data.tokens.total_tokens
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

  emitMetric(event: MetricEvent, data: any) {
    this.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}

export const metricsService = new MetricsService();
