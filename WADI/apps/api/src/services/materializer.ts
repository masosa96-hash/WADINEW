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
   async materialize(projectId: string, options: { dryRun?: boolean; overrideStructure?: any } = {}): Promise<{ success: boolean; filesCreated: number; blueprint?: any; deployUrl?: string }> {
    const runId = await this.startRun(projectId, options.dryRun ? "PREVIEW_BLUEPRINT" : "MATERIALIZATION");

    try {
      // 1. Fetch project structure (or use override)
      let structure: any;
      let userId: string | undefined;

      if (options.overrideStructure) {
        structure = options.overrideStructure;
        logger.info({ msg: "materialize_using_override", projectId });
      } else {
        const { data: project, error } = await (supabase as any)
          .from("projects")
          .select("structure, user_id")
          .eq("id", projectId)
          .single();

        if (error || !project?.structure) {
          throw new Error("Project structure not found or incomplete");
        }
        structure = project.structure;
        userId = project.user_id;
      }
      const templateId = structure.templateId;
      const features = structure.features || [];
      const files = structure.files || [];

      if (options.dryRun) {
        await this.endRun(runId, "SUCCESS", { 
          blueprint: files.map((f: any) => f.path),
          templateId,
          features
        });
        return { success: true, filesCreated: 0, blueprint: files };
      }

      // 2. Scaffolding Initialization
      if (templateId) {
        logger.info({ msg: "scaffolding_start", projectId, templateId });
        await toolRegistry.callTool("initialize_scaffolding", { projectId, templateId });
      }

      // 3. Feature Implementation (Orchestration)
      if (features.length > 0) {
        for (const feature of features) {
          const featureId = typeof feature === 'string' ? feature : feature.id;
          const params = typeof feature === 'string' ? {} : (feature.params || {});
          
          logger.info({ msg: "feature_implementation_start", projectId, featureId, params });
          await toolRegistry.callTool("implement_feature", { projectId, featureId, params });
        }
      }

      // 4. Safety Limit: Max files to prevent disk saturation
      if (files.length > 50) {
        throw new Error("Safety limit exceeded: Project has too many files (max 50).");
      }

      if (options.dryRun) {
        await this.endRun(runId, "SUCCESS", { blueprint: files.map((f: any) => f.path) });
        return { success: true, filesCreated: 0, blueprint: files };
      }

      logger.info({ msg: "materialization_start", projectId, fileCount: files.length });

      // 4b. Write custom project files
      let createdCount = 0;
      for (const file of files) {
        await toolRegistry.callTool("write_file", {
          path: `${projectId}/${file.path}`,
          content: file.content
        });
        createdCount++;
      }

      // 5. Build Verification (non-blocking: warn on failure, don't abort materialization)
      logger.info({ msg: "build_verification_start", projectId });
      try {
        const buildRes = await toolRegistry.callTool("validate_build", { 
          projectId,
          command: "npx tsc --noEmit"
        });
        if (!buildRes.success) {
          logger.warn({ msg: "build_verification_warning", projectId, errors: buildRes.errors });
        }
      } catch (buildErr: any) {
        logger.warn({ msg: "build_verification_skipped", projectId, reason: buildErr.message });
      }

      // 6. Automatic Deployment (Optional)
      let deployUrl: string | undefined;
      if (structure.shouldDeploy) {
        logger.info({ msg: "auto_deploy_start", projectId });
        const deployRes = await toolRegistry.callTool("deploy_project", { 
          projectId, 
          provider: structure.deployProvider || "render" 
        });
        if (deployRes.success) {
          deployUrl = deployRes.url;
        }
      }

      // 7. Commit changes
      await toolRegistry.callTool("git_commit", {
        projectId,
        message: `WADI: Automated materialization of ${structure.name}`
      });

      await this.endRun(runId, "SUCCESS", { 
        filesCreated: createdCount,
        templateId,
        features,
        deployUrl
      });
      return { success: true, filesCreated: createdCount, deployUrl };

    } catch (error: any) {
      logger.error({ msg: "materialization_failed", projectId, error: error.message });
      await this.endRun(runId, "FAILED", {}, error.message);
      return { success: false, filesCreated: 0 };
    }
  }

  private async startRun(projectId: string, stepName: string): Promise<string | null> {
    try {
      const { data, error } = await (supabase as any).from("project_runs").insert({
        project_id: projectId,
        step_name: stepName,
        status: "IN_PROGRESS"
      }).select().single();

      if (error || !data) {
        logger.warn({ msg: "start_run_no_id", projectId, error: error?.message });
        return null;
      }
      return data.id;
    } catch (e) {
      return null;
    }
  }

  private async endRun(runId: string | null, status: string, logs: any = {}, errorMessage?: string) {
    if (!runId) return;
    try {
      await (supabase as any).from("project_runs").update({
        status,
        logs: JSON.stringify(logs),
        error_message: errorMessage,
        updated_at: new Date().toISOString()
      }).eq("id", runId);
    } catch (e) {
      logger.error({ msg: "end_run_failed", runId, error: (e as Error).message });
    }
  }
}

export const materializer = new MaterializerService();
