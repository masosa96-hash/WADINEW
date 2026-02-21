
import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase";
import { AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth";
import { generateCrystallizeStructure } from "../wadi-brain";

// Helper: Generate Technical Project Name
export function generateProjectName(description: string): string {
  const cleanDesc = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
  const words = cleanDesc.split(/\s+/).slice(0, 3);
  const name = words.join("-") || "untitled-project";
  return `${name}-${Date.now().toString().slice(-4)}`;
}

export const listProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id as any;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new AppError("DB_ERROR", error.message);
  res.json(data);
};

export const getProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.id as any;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id as any)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("NOT_FOUND", "Proyecto no encontrado");
    }
    throw new AppError("DB_ERROR", error.message);
  }
  res.json(data);
};

export const crystallizeProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id as any;
  let { name, description, suggestionContent } = req.body as any;

  // Support both direct name/description and legacy suggestionContent JSON
  if (!name && suggestionContent) {
    try {
      const parsed = typeof suggestionContent === "string"
        ? JSON.parse(suggestionContent)
        : suggestionContent;
      name = parsed.name || "Idea Sin Nombre";
      description = parsed.content || parsed.description || "";
    } catch {
      name = "Idea Sin Nombre";
      description = typeof suggestionContent === "string" ? suggestionContent : "";
    }
  }

  if (!name) {
    name = description ? generateProjectName(description) : `project-${Date.now()}`;
  }
  if (!description) description = "Generado por WADI";

  // Step 1: INSERT inmediato con status GENERATING_STRUCTURE
  const { data: projectRaw, error: insertError } = await supabase
    .from("projects")
    .insert([{
      user_id: userId,
      name,
      description,
      status: "GENERATING_STRUCTURE",
    }] as any)
    .select()
    .single();

  if (insertError) throw new AppError("DB_ERROR", insertError.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const project = projectRaw as any;

  // Respond immediately — frontend starts polling
  res.status(201).json({ project });

  // Step 2: Async job — generate structure without blocking response
  (async () => {
    const startedAt = Date.now();
    try {
      // Fetch existing project names for deduplication context
      const { data: existing } = await supabase
        .from("projects")
        .select("name")
        .eq("user_id", userId)
        .neq("id", project.id);

      const existingNames = (existing || []).map((p: any) => p.name);

      const structure = await generateCrystallizeStructure(name, description, existingNames);
      const duration = Date.now() - startedAt;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("projects")
        .update({
          structure,
          structure_version: 1,
          status: "READY",
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id);

      console.log(`[CRYSTALLIZE] Project ${project.id} — OK — ${duration}ms`);
    } catch (err) {
      const duration = Date.now() - startedAt;
      console.error(`[CRYSTALLIZE] Project ${project.id} — FAILED — ${duration}ms —`, (err as Error).message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("projects")
        .update({ status: "STRUCTURE_FAILED", updated_at: new Date().toISOString() })
        .eq("id", project.id);
    }
  })();
};

export const bulkDeleteProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id as any;
  const { projectIds } = req.body;

  if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
    return res.status(400).json({ error: "No project IDs provided" });
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .in("id", projectIds as any)
    .eq("user_id", userId);

  if (error) throw new AppError("DB_ERROR", error.message);

  res.json({ message: "Projects deleted successfully" });
};
