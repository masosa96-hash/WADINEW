
import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase";
import { AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth";

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
  const user = req.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = user!.id as any;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const user = req.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = user!.id as any;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const user = req.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = user!.id as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { name, description } = req.body as any;

  if (!name && description) {
    name = generateProjectName(description);
  } else if (!name && !description) {
    name = `project-${Date.now()}`;
    description = "Sin descripción";
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        user_id: userId,
        name: name,
        description: description,
        status: "PLANNING",
      },
    ] as any)
    .select()
    .single();

  if (error) throw new AppError("DB_ERROR", error.message);

  res.json(data);
};

export const bulkDeleteProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = user!.id as any;
  const { projectIds } = req.body; // Array de UUIDs

  if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
    return res.status(400).json({ error: "No project IDs provided" });
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .in("id", projectIds as any)
    .eq("user_id", userId);

  if (error) {
    throw new AppError("DB_ERROR", error.message);
  }

  res.json({ message: "Projects deleted successfully" });
};
