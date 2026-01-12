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
      })
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

    const { AIQueueService } = await import("../../services/aiQueueService");

    // 2. Dispatch AI Job
    // TODO: Fetch recent activity context if needed
    const jobInfo = await AIQueueService.dispatch(
      userId,
      "SUGGEST_NEXT_ACTIONS",
      {
        projects: [project],
        recentActivity: [], // Placeholder for now
      }
    );

    return {
      message: "AI Analysis started",
      jobId: jobInfo.jobId,
    };
  }
}
