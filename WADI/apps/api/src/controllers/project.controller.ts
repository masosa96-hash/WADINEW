import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase";
import { AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth";
import { generateCrystallizeStructure, CRYSTALLIZE_PROMPT_VERSION } from "../wadi-brain";
import { logProjectEdit, updateCognitiveProfile, getCognitiveProfileSummary } from "../services/cognitive-service";
import { incrementGlobalBudget } from "../middleware/rateLimiter";
import { z } from "zod";

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

const CrystallizeSchema = z.object({
  name: z.string().max(100).optional(),
  description: z.string().max(5000).min(10),
  suggestionContent: z.any().optional(),
  firstMessageAt: z.string().datetime().optional(),
}).strict(); // Reject unknown fields to prevent metadata manipulation

export const crystallizeProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id as any;
  
  // 1. Initial length guard
  if (req.body?.description?.length > 5000) {
    return res.status(400).json({ error: "Description is too large (max 5000 chars)" });
  }

  const validated = CrystallizeSchema.safeParse(req.body);
  
  if (!validated.success) {
    return res.status(400).json({ error: "Invalid input", details: validated.error.format() });
  }

  let { name, description, suggestionContent, firstMessageAt } = validated.data;

  // Support legacy suggestionContent JSON (sanitized)
  if (!name && suggestionContent) {
    try {
      const parsed = typeof suggestionContent === "string"
        ? JSON.parse(suggestionContent)
        : suggestionContent;
      name = String(parsed.name || "").slice(0, 100) || "Idea Sin Nombre";
      const descPart = String(parsed.content || parsed.description || "").slice(0, 5000);
      if (descPart) description = descPart;
    } catch {
      name = "Idea Sin Nombre";
    }
  }

  if (!name) {
    name = generateProjectName(description);
  }

  // Double check description after legacy parsing
  if (description.length > 5000) description = description.slice(0, 5000);

  // Step 1: INSERT inmediato con status GENERATING_STRUCTURE
  const { data: projectRaw, error: insertError } = await supabase
    .from("projects")
    .insert([{
      user_id: userId,
      name,
      description,
      status: "GENERATING_STRUCTURE",
      first_message_at: firstMessageAt || null,
    }] as any)
    .select()
    .single();

  if (insertError) throw new AppError("DB_ERROR", insertError.message);
  
  // Track global budget usage
  incrementGlobalBudget();

  // DASHBOARD SIGNAL: Input Length
  const inputLength = description.length;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const project = projectRaw as any;

  // Respond immediately — frontend starts polling
  res.status(201).json({ project });

  // Step 2: Async job — generate structure without blocking response
  (async () => {
    const startedAt = Date.now();
    try {
      console.log(`[DASHBOARD_SIGNAL] event=CRYSTALLIZE_START user_id=${userId} project_id=${project.id} input_length=${inputLength}`);
      // Abort controller or simple timeout logic in LLM service (assumed present or handled by AI provider)
      // Here we just wrap in try/catch to ensure status is updated if it fails
      
      const { data: existing } = await supabase
        .from("projects")
        .select("name")
        .eq("user_id", userId)
        .neq("id", project.id);

      const existingNames = (existing || []).map((p: any) => p.name);

      const cognitiveSummary = await getCognitiveProfileSummary(userId);
      const { data: userProfile } = await (supabase as any)
        .from("user_cognitive_profile_current")
        .select("profile_version")
        .eq("user_id", userId)
        .single();
      
      const currentProfileVersion = userProfile?.profile_version ?? 1;

      const structure = await generateCrystallizeStructure(name, description, existingNames, cognitiveSummary);
      const duration = Date.now() - startedAt;
      const ttv_ms = firstMessageAt ? Date.now() - new Date(firstMessageAt).getTime() : null;

      await (supabase as any)
        .from("projects")
        .update({
          structure,
          structure_version: 1,
          profile_version: currentProfileVersion,
          prompt_version: CRYSTALLIZE_PROMPT_VERSION,
          ttv_ms,
          status: "READY",
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)
        .eq("user_id", userId); // Critical: Security check even in async update

      console.log(`[DASHBOARD_SIGNAL] event=CRYSTALLIZE_READY user_id=${userId} project_id=${project.id} job_duration=${duration}ms ttv_ms=${ttv_ms}`);
      console.log(`[CRYSTALLIZE] Project ${project.id} — OK — ${duration}ms`);
    } catch (err) {
      const duration = Date.now() - startedAt;
      console.error(`[CRYSTALLIZE] Project ${project.id} — FAILED — ${duration}ms —`, (err as Error).message);
      await (supabase as any)
        .from("projects")
        .update({ status: "STRUCTURE_FAILED", updated_at: new Date().toISOString() })
        .eq("id", project.id)
        .eq("user_id", userId);
    }
  })();
};

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const ProjectStructureSchema = z.object({
  problem: z.string().min(3).max(2000),
  solution: z.string().min(3).max(2000),
  target_icp: z.string().min(3).max(1000),
  value_proposition: z.string().min(3).max(1000),
  recommended_stack: z.string().min(3).max(1000),
  milestones: z.array(z.string().min(1).max(500)).min(1).max(30),
  risks: z.array(z.string().min(1).max(500)).min(1).max(20),
  validation_steps: z.array(z.string().min(1).max(500)).min(1).max(20),
  templateId: z.string().optional(),
  features: z.array(z.object({
    id: z.string(),
    params: z.record(z.string()).optional()
  })).optional(),
  shouldDeploy: z.boolean().optional(),
  deployProvider: z.enum(["render", "vercel"]).optional(),
}).strict(); // Security: Prevent extra top-level keys like { "admin": true }

export const updateProjectStructure = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.id as any;
  const { structure } = req.body;

  const validated = ProjectStructureSchema.safeParse(structure);
  if (!validated.success) {
    return res.status(400).json({ error: "Invalid structure data", details: validated.error.format() });
  }

  // 1. Fetch current (also serves as ownership check)
  const { data: current, error: fetchError } = await (supabase as any)
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !current) throw new AppError("NOT_FOUND", "Proyecto no encontrado o acceso denegado");

  // Concurrency Lock: Prevent editing while generating
  if (current.status === "GENERATING_STRUCTURE") {
    return res.status(409).json({ error: "No se puede editar mientras se genera la estructura" });
  }

  // Verify ownership again explicitly just in case PGRST116 is handled differently
  if (current.user_id !== userId) throw new AppError("NOT_AUTHORIZED", "No tenés permiso para editar este proyecto");

  const nextVersion = (current?.structure_version ?? 1) + 1;

  const updatePayload = {
    structure: validated.data,
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
      const oldStructure = (current.structure || {}) as Record<string, any>;
      const newStructure = validated.data as Record<string, any>;

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
