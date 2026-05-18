import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth-beta";
import { supabase } from "../config/supabase";
import { getChatCompletion } from "../services/openai";
import { extractAndSaveKnowledge } from "../services/knowledge-service";
import { AppError } from "../middleware/error.middleware";

export const listRuns = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
    throw new AppError("DB_ERROR", "Failed to list runs", 500, { cause: error });
  }
};

import { generateSystemPrompt } from "../wadi-brain";

export const createRun = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;
    const { input, model } = req.body;

    if (!input) {
      throw new AppError("BAD_REQUEST", "Input is required", 400);
    }

    // 1. Verify project ownership
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("*") 
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (projError || !project) {
      throw new AppError("NOT_FOUND", "Project not found", 404);
    }

    // 2. Call OpenAI using UNIFIED BRAIN
    const aiModel = model || "gpt-3.5-turbo";
    let output = "";
    
    // Generate unified prompt with project context
    const { prompt: systemPrompt } = generateSystemPrompt({ projectContext: { description: project.description } });

    try {
        // Pass systemPrompt explicitly to use the unified one
        output = await getChatCompletion(input, aiModel, systemPrompt) || "";
    } catch (aiErr) {
        throw new AppError("SERVICE_UNAVAILABLE", "AI Service Unavailable", 502, { cause: aiErr });
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
    next(error);
  }
};
