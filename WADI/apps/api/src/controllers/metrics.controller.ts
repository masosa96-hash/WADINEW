import { Request, Response } from "express";
import { supabase } from "../supabase";
import { logger } from "../core/logger";

/**
 * Fetches consolidated business metrics for the admin dashboard
 */
export const getAdminMetrics = async (req: Request, res: Response) => {
  try {
    // 1. Availability (Breaker Metrics)
    const { data: breakerData } = await (supabase as any)
      .from("breaker_metrics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    // 2. Token Usage (Costs)
    const { data: tokenData } = await (supabase as any)
      .from("token_usage")
      .select("total_tokens, provider")
      .order("created_at", { ascending: false })
      .limit(1000);

    // 3. Conversion Time (Efficiency)
    const { data: projectData } = await (supabase as any)
      .from("projects")
      .select("conversion_time_ms")
      .not("conversion_time_ms", "is", null);

    // Consolidate basic insights
    const totalTokens = (tokenData as any[])?.reduce((acc, curr) => acc + (curr.total_tokens || 0), 0) || 0;
    const avgConversionTime = projectData && projectData.length > 0
      ? (projectData as any[]).reduce((acc, curr) => acc + (curr.conversion_time_ms || 0), 0) / projectData.length
      : 0;

    return res.json({
      success: true,
      metrics: {
        totalTokensTracked: totalTokens,
        avgConversionTimeMs: Math.round(avgConversionTime),
        projectsCrystallized: projectData?.length || 0,
        recentBreakerEvents: breakerData?.length || 0
      }
    });
  } catch (error: any) {
    logger.error({ msg: "failed_to_fetch_metrics", error: error.message });
    return res.status(500).json({ success: false, error: "METRICS_FETCH_FAILED" });
  }
};
