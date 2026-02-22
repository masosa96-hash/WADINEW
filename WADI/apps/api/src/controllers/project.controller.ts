
import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase";
import { AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth";
import { generateCrystallizeStructure, CRYSTALLIZE_PROMPT_VERSION } from "../wadi-brain";
import { logProjectEdit, updateCognitiveProfile, getCognitiveProfileSummary } from "../services/cognitive-service";

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

      // Fetch cognitive profile for individual adaptation
      const cognitiveSummary = await getCognitiveProfileSummary(userId);
      const { data: userProfile } = await (supabase as any)
        .from("user_cognitive_profile_current")
        .select("profile_version")
        .eq("user_id", userId)
        .single();
      
      const currentProfileVersion = userProfile?.profile_version ?? 1;

      const structure = await generateCrystallizeStructure(name, description, existingNames, cognitiveSummary);
      const duration = Date.now() - startedAt;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("projects")
        .update({
          structure,
          structure_version: 1,
          profile_version: currentProfileVersion,
          prompt_version: CRYSTALLIZE_PROMPT_VERSION,
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

// ─── Types ──────────────────────────────────────────────────────────────────

type ProjectUpdate = {
  structure: Record<string, unknown>;
  structure_version: number;
  updated_at: string;
};

const STRUCTURE_REQUIRED_KEYS = [
  "problem",
  "solution",
  "target_icp",
  "value_proposition",
  "recommended_stack",
  "milestones",
  "risks",
  "validation_steps",
] as const;

const STRUCTURE_ARRAY_KEYS = ["milestones", "risks", "validation_steps"] as const;

function validateStructurePayload(s: any): string | null {
  if (!s || typeof s !== "object" || Array.isArray(s)) return "structure must be a plain object";
  for (const key of STRUCTURE_REQUIRED_KEYS) {
    if (s[key] === undefined || s[key] === null) return `Missing required field: ${key}`;
  }
  for (const key of STRUCTURE_ARRAY_KEYS) {
    if (!Array.isArray(s[key]) || s[key].length < 1) {
      return `Field "${key}" must be a non-empty array`;
    }
    if (s[key].some((item: any) => typeof item !== "string" || item.trim() === "")) {
      return `All items in "${key}" must be non-empty strings`;
    }
  }
  const textKeys = ["problem", "solution", "target_icp", "value_proposition", "recommended_stack"] as const;
  for (const key of textKeys) {
    if (typeof s[key] !== "string" || s[key].trim().length < 3) {
      return `Field "${key}" must be a string with at least 3 characters`;
    }
  }
  return null; // valid
}

export const updateProjectStructure = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.id as any;
  const { structure } = req.body;

  const validationError = validateStructurePayload(structure);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Fetch current version to increment
  const { data: current, error: fetchError } = await (supabase as any)
    .from("projects")
    .select("structure_version")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError) throw new AppError("NOT_FOUND", "Proyecto no encontrado");

  const nextVersion = (current?.structure_version ?? 1) + 1;

  const updatePayload: ProjectUpdate = {
    structure,
    structure_version: nextVersion,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase as any)
    .from("projects")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new AppError("DB_ERROR", error.message);

  console.log(`[STRUCTURE EDIT] Project ${id} — version ${nextVersion}`);
  res.json({ project: data });

  // Post-update analysis (fire & forget)
  (async () => {
    try {
      const oldStructure = current.structure || {};
      const newStructure = structure;

      const fieldsToCheck = ["problem", "solution", "target_icp", "value_proposition", "recommended_stack", "milestones", "risks", "validation_steps"];
      
      for (const field of fieldsToCheck) {
        if (JSON.stringify(oldStructure[field]) !== JSON.stringify(newStructure[field])) {
          await logProjectEdit(userId, id, field, oldStructure[field], newStructure[field]);
        }
      }

      await updateCognitiveProfile(userId);
    } catch (e) {
      console.error("[COGNITIVE] Error in post-update hook:", e);
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
