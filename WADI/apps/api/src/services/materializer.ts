import { supabase } from "../supabase";
import { toolRegistry } from "./tool-registry";
import { logger } from "../core/logger";

export interface ProjectBrief {
  recommended_stack: string;
  milestones: string[];
  // Assuming the crystallization result has a "files" or "structure" field we will add
  files?: Array<{ path: string; content: string }>;
}

export class MaterializerService {
  /**
   * Translates a crystallized project structure into real files on disk
   */
  async materialize(projectId: string, options: { dryRun?: boolean } = {}): Promise<{ success: boolean; filesCreated: number; blueprint?: any }> {
    const runId = await this.startRun(projectId, options.dryRun ? "PREVIEW_BLUEPRINT" : "MATERIALIZATION");

    try {
      // 1. Fetch project structure
      const { data: project, error } = await (supabase as any)
        .from("projects")
        .select("structure, user_id")
        .eq("id", projectId)
        .single();

      if (error || !project?.structure) {
        throw new Error("Project structure not found or incomplete");
      }

      const structure = project.structure as any;
      const files = structure.files || [];

      if (files.length === 0) {
        throw new Error("No files defined in project structure to materialize");
      }

      // 2. Safety Limit: Max files to prevent disk saturation
      if (files.length > 50) {
        throw new Error("Safety limit exceeded: Project has too many files (max 50).");
      }

      if (options.dryRun) {
        await this.endRun(runId, "SUCCESS", { blueprint: files.map((f: any) => f.path) });
        return { success: true, filesCreated: 0, blueprint: files };
      }

      logger.info({ msg: "materialization_start", projectId, fileCount: files.length });

      let createdCount = 0;
      for (const file of files) {
        await toolRegistry.callTool("write_file", {
          path: `${projectId}/${file.path}`, // Use project subfolder
          content: file.content
        });
        createdCount++;
      }

      // 3. Automatic Git Isolation Commit
      await toolRegistry.callTool("git_commit", {
        projectId,
        message: `[WADI] Initial Materialization - ${new Date().toISOString()}`
      });

      await this.endRun(runId, "SUCCESS", { filesCreated: createdCount });
      return { success: true, filesCreated: createdCount };

    } catch (error: any) {
      logger.error({ msg: "materialization_failed", projectId, error: error.message });
      await this.endRun(runId, "FAILED", {}, error.message);
      return { success: false, filesCreated: 0 };
    }
  }

  private async startRun(projectId: string, stepName: string): Promise<string> {
    const { data, error } = await (supabase as any).from("project_runs").insert({
      project_id: projectId,
      step_name: stepName,
      status: "IN_PROGRESS"
    }).select().single();

    if (error) throw error;
    return data.id;
  }

  private async endRun(runId: string, status: string, logs: any = {}, errorMessage?: string) {
    await (supabase as any).from("project_runs").update({
      status,
      logs: JSON.stringify(logs),
      error_message: errorMessage,
      updated_at: new Date().toISOString()
    }).eq("id", runId);
  }
}

export const materializer = new MaterializerService();
