import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth-beta";
import { supabase } from "../config/supabase";

export const listProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error("Error listing projects:", error);
    res.status(500).json({ error: "Failed to list projects" });
  }
};

export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          user_id: userId,
          name,
          description,
          status: "PLANNING",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error: any) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};
