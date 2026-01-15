import { supabase } from "../../supabase";
import { CreateProjectInput, UpdateProjectInput, ProjectDTO, ProjectStatus } from "@wadi/core";

export class ProjectsService {
  /**
   * List projects for a specific user
   */
  static async list(userId: string): Promise<ProjectDTO[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as unknown as ProjectDTO[];
  }

  /**
   * Create a new project
   */
  static async create(userId: string, input: CreateProjectInput): Promise<ProjectDTO> {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description,
        status: input.status || ProjectStatus.PLANNING,
      } as any)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as ProjectDTO;
  }

  /**
   * Get a single project
   */
  static async get(userId: string, projectId: string): Promise<ProjectDTO | null> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .eq("id", projectId)
      .single();

    if (error) return null;
    return data as unknown as ProjectDTO;
  }

  /**
   * Update a project
   */
  static async update(
    userId: string,
    projectId: string,
    updates: UpdateProjectInput
  ): Promise<ProjectDTO> {
    const { data, error } = await supabase
      .from("projects")
      // @ts-ignore
      .update(updates)
      .eq("user_id", userId)
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as ProjectDTO;
  }

  /**
   * Delete a project
   */
  static async delete(userId: string, projectId: string): Promise<boolean> {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("user_id", userId)
      .eq("id", projectId);

    if (error) throw new Error(error.message);
    return true;
  }

  /**
   * Analyze a project using AI
   */
  static async analyzeProject(userId: string, projectId: string) {
    // 1. Verify project ownership and existence
    const project = await this.get(userId, projectId);
    if (!project) throw new Error("Project not found");

    // 2. Dispatch AI Job (MOCKED for No-Redis)
    console.log("[ProjectService] Analysis requested (Redis disabled, skipping execution)");

    return {
      message: "AI Analysis started (MOCKED)",
      jobId: "mock-job-" + Date.now(),
    };
  }

  /**
   * Save AI Insight (Called by Worker)
   */
  static async saveInsight(
    jobId: string,
    userId: string,
    insight: {
      type: "SUGGESTION" | "WARNING" | "INFO";
      message: string;
      confidence: number;
      relatedProjectId?: string;
    }
  ) {
    const { error } = await supabase.from("ai_insights").insert({
      job_id: jobId,
      user_id: userId,
      type: insight.type,
      message: insight.message,
      confidence: insight.confidence,
      related_project_id: insight.relatedProjectId,
    } as any);

    if (error) throw new Error(`Failed to save insight: ${error.message}`);
    return true;
  }
}
