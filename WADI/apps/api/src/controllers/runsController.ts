import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth-beta";
import { supabase } from "../config/supabase";
import { getChatCompletion } from "../services/openai";
import { extractAndSaveKnowledge } from "../services/knowledge-service";

export const listRuns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    // Verify project ownership logic could be here or implicitly by user_id filter if we trust the param
    // But better to check project exists and belongs to user first?
    // For Beta 1, we can just filter by project_id AND user_id in the runs query.

    const { data, error } = await supabase
      .from("runs")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error("Error listing runs:", error);
    res.status(500).json({ error: "Failed to list runs" });
  }
};

import { generateSystemPrompt } from "../wadi-brain";

export const createRun = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;
    const { input, model } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    // 1. Verify project ownership
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("*") 
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (projError || !project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // 2. Call OpenAI using UNIFIED BRAIN
    const aiModel = model || "gpt-3.5-turbo";
    let output = "";
    
    // Generate unified prompt with project context
    const { prompt: systemPrompt } = generateSystemPrompt(undefined, project.description);

    try {
        // Pass systemPrompt explicitly to use the unified one
        output = await getChatCompletion(input, aiModel, systemPrompt) || "";
    } catch (aiErr) {
        return res.status(502).json({ error: "AI Service Unavailable" });
    }

    // 3. Store Run
    const { data: run, error: runError } = await supabase
      .from("runs")
      .insert([
        {
          project_id: projectId,
          user_id: userId,
          input,
          output,
          model: aiModel,
        },
      ])
      .select()
      .single();

    if (runError) throw runError;

    // 4. RAG TRIGGER (Fire-and-forget)
    // "El momento Ajá" - WADI aprende de cada interacción
    extractAndSaveKnowledge(userId, input).catch(err => 
        console.error("RAG Background Error:", err)
    );

    res.status(201).json(run);
  } catch (error: any) {
    console.error("Error creating run:", error);
    res.status(500).json({ error: "Failed to create run" });
  }
};
