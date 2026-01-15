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

export const crystallize = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { suggestionContent } = req.body;

    if (!suggestionContent) {
        return res.status(400).json({ error: "No content provided" });
    }

    let parsed;
    try {
        parsed = typeof suggestionContent === 'string' ? JSON.parse(suggestionContent) : suggestionContent;
    } catch {
        parsed = { name: "Idea Sin Nombre", content: suggestionContent, tags: [] };
    }
    
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          user_id: userId,
          name: parsed.name || "Proyecto Nuevo",
          description: parsed.content || parsed.description || "Generado por WADI",
          status: "PLANNING",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ project: data });

  } catch (error: any) {
    console.error("Error crystallizing project:", error);
    res.status(500).json({ error: "Failed to crystallize" });
  }
};

