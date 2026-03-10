import { Response, NextFunction } from "express";
import { supabase } from "../supabase";
import { AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth";
import axios from "axios";

// Node API -> AI Engine interop URL
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

export const getProjectGenome = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.id as any;

  // We fetch the project and its related dimensions, scores, DNA, and playbooks
  const { data: project, error: pError } = await (supabase as any)
    .from("projects")
    .select("*, idea:ideas(*, dimensions:idea_dimensions(*), scores:idea_scores(*), dna:idea_dna(*))")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (pError || !project) {
    throw new AppError("NOT_FOUND", "Project not found");
  }

  // Also grab deployments to show the active Live URL
  const { data: deployments } = await (supabase as any)
    .from("deployments")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(1);

  const activeDeployment = deployments && deployments.length > 0 ? deployments[0] : null;

  res.json({
    id: project.id,
    name: project.name,
    dna: project.dna || "Unknown",
    score: project.score || 0,
    business_model: project.business_model || "SaaS",
    repo_url: `https://github.com/wadi-ai/${project.name}`,
    live_url: activeDeployment?.deploy_url || null
  });
};

export const getProjectFeed = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.id as any;

  // Verify ownership first
  const { data: project, error: pError } = await (supabase as any).from("projects").select("id").eq("id", id).eq("user_id", userId).single();
  if (pError || !project) throw new AppError("NOT_FOUND", "Project not found");

  const { data: feed, error } = await (supabase as any)
    .from("project_feed")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (error) throw new AppError("DB_ERROR", error.message);
  
  res.json(feed);
};

export const getProjectInsights = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.id as any;

  // Verify ownership
  const { data: project, error: pError } = await (supabase as any).from("projects").select("id").eq("id", id).eq("user_id", userId).single();
  if (pError || !project) throw new AppError("NOT_FOUND", "Project not found");

  const { data: insights, error } = await (supabase as any)
    .from("evolution_insights")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (error) throw new AppError("DB_ERROR", error.message);
  
  res.json(insights);
};

export const getProjectPRs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
    // In a full implementation we would query GitHub Octokit for PRs linked to this repo.
    // For now we mock the API response.
    const { id } = req.params;
    const userId = req.user!.id as any;
  
    // Verify ownership
    const { data: project, error: pError } = await (supabase as any).from("projects").select("id, name").eq("id", id).eq("user_id", userId).single();
    if (pError || !project) throw new AppError("NOT_FOUND", "Project not found");

    res.json([
        { 
          id: "1", 
          title: "Add Google OAuth login", 
          status: "open", 
          pr_url: "https://github.com/user/repo/pull/3",
          created_at: new Date().toISOString()
        }
    ]);
};

export const triggerEvolution = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.id as any;

  // Verify ownership and get github token
  const { data: project, error: pError } = await (supabase as any)
    .from("projects")
    .select("*, idea:ideas(dna:idea_dna(*))")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
    
  if (pError || !project) throw new AppError("NOT_FOUND", "Project not found");

  const { data: ghAccount } = await (supabase as any)
    .from("github_accounts")
    .select("access_token")
    .eq("user_id", userId)
    .single();

  if (!ghAccount || !ghAccount.access_token) {
    return res.status(400).json({ error: "No GitHub token mapped to this user. Connect GitHub first." });
  }

  // Assuming github repo name follows convention:
  // In a real database we would save the github_repo_url explicitly in the projects table on publish
  const githubOwner = process.env.GITHUB_OWNER || project.name.split('-')[0];
  const hardcodedRepoUrl = `https://github.com/${githubOwner}/${project.name}`;

  try {
    const aiResponse = await axios.post(`${AI_ENGINE_URL}/evolve`, {
      project_id: id,
      repo_url: hardcodedRepoUrl,
      github_token: ghAccount.access_token,
      dna: project.idea?.dna?.[0] || {}
    });

    // Log the insight and feed event to DB so it shows on Dashboard
    if (aiResponse.data?.status === "pr_opened") {
        await (supabase as any).from("project_feed").insert({
            project_id: id,
            type: "pr_generated",
            message: `Wadi created a new feature PR: ${aiResponse.data.branch}`,
            metadata: { pr_url: aiResponse.data.pr_url }
        });
        
        await (supabase as any).from("evolution_insights").insert({
            project_id: id,
            insight_type: "metrics_analysis",
            description: `Wadi detected metrics drop and generated feature branch: ${aiResponse.data.branch}`,
            status: "pr_generated"
        });
    }

    res.json(aiResponse.data);
  } catch (error: any) {
    console.error("[EVOLUTION] Failed:", error?.message);
    throw new AppError("EXTERNAL_API_ERROR", "Failed to trigger AI Evolution Engine");
  }
};
