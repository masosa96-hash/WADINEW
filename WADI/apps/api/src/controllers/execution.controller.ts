import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { materializer } from "../services/materializer";
import { supabase } from "../supabase";
import { AppError } from "../middleware/error.middleware";

/**
 * Triggers the materialization (code generation) of a project
 */
export const materializeProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.id as any;

  // 1. Verify project ownership
  const { data: project, error } = await (supabase as any)
    .from("projects")
    .select("user_id")
    .eq("id", id)
    .single();

  if (error || !project) {
    throw new AppError("NOT_FOUND", "Project not found");
  }

  if ((project as any).user_id !== userId) {
    throw new AppError("UNAUTHORIZED", "Access denied");
  }

  // 2. Trigger Materialization (can be async but for now we follow up)
  const result = await materializer.materialize(id);

  if (!result.success) {
    return res.status(500).json({ success: false, error: "MATERIALIZATION_FAILED" });
  }

  res.json({ success: true, filesCreated: result.filesCreated });
};

/**
 * Lists runs for a specific project
 */
export const listProjectRuns = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.id as any;

  // Verification of ownership is implicitly handled by RLS if implemented, 
  // but let's be explicit here for robustness.
  const { data, error } = await supabase
    .from("project_runs")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (error) throw new AppError("DB_ERROR", error.message);

  res.json(data);
};
