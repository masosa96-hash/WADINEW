import { supabase } from "../supabase";
import { toolRegistry } from "./tool-registry";
import { logger } from "../core/logger";
import { ExecutionPolicy } from "../core/execution-policy";
import { eventBus } from "../core/event-bus";
import type {
  ProjectStructure,
  FeatureRequest,
  ProjectFile,
  RunLogs,
  BlueprintResult,
  BuildResult
} from "../types/domain";
import * as crypto from "crypto";

export class MaterializerService {
  /**
   * Translates a crystallized project structure into real files on disk.
   * - Every run has a unique correlationId for end-to-end tracing.
   * - Idempotent: if a run for projectId is already IN_PROGRESS, it aborts safely.
   * - Communicates completion via the Event Bus (no direct Infra imports).
   */
  async materialize(
    projectId: string,
    options: { dryRun?: boolean; overrideStructure?: ProjectStructure } = {}
  ): Promise<BlueprintResult> {
    const correlationId = crypto.randomUUID();

    // ── Idempotency Guard ─────────────────────────────────────────────────────
    // Check for an existing IN_PROGRESS run to avoid double-materialization.
    const isAlreadyRunning = await this.isRunInProgress(projectId);
    if (isAlreadyRunning) {
      logger.warn({ msg: "materialize_skipped_already_running", projectId, correlationId });
      return { success: false, filesCreated: 0, correlationId };
    }

    const runId = await this.startRun(projectId, options.dryRun ? "PREVIEW_BLUEPRINT" : "MATERIALIZATION", correlationId);

    try {
      // 1. Fetch project structure (or use override for testing)
      let structure: ProjectStructure;

      if (options.overrideStructure) {
        structure = options.overrideStructure;
        logger.info({ msg: "materialize_using_override", projectId, correlationId });
      } else {
        const { data: project, error } = await (supabase as any)
          .from("projects")
          .select("structure, user_id")
          .eq("id", projectId)
          .single();

        if (error || !project?.structure) {
          throw new Error("Project structure not found or incomplete");
        }
        structure = project.structure as ProjectStructure;
      }

      const templateId = structure.templateId;
      const features: FeatureRequest[] = structure.features || [];
      const files: ProjectFile[] = structure.files || [];

      // Dry run: return blueprint without writing
      if (options.dryRun) {
        const logs: RunLogs = { blueprint: files.map(f => f.path), templateId, features };
        await this.endRun(runId, "SUCCESS", logs);
        return { success: true, filesCreated: 0, blueprint: files, correlationId };
      }

      // 2. Scaffolding
      if (templateId) {
        logger.info({ msg: "scaffolding_start", projectId, templateId, correlationId });
        await toolRegistry.callTool("initialize_scaffolding", { projectId, templateId });
        eventBus.emit("SCAFFOLDING_COMPLETE", { projectId, correlationId, templateId });
      }

      // 3. Feature Implementation
      for (const feature of features) {
        const featureId = typeof feature === "string" ? feature : feature.id;
        const params = typeof feature === "string" ? {} : (feature.params || {});
        logger.info({ msg: "feature_start", projectId, featureId, correlationId });
        await toolRegistry.callTool("implement_feature", { projectId, featureId, params });
        eventBus.emit("FEATURE_IMPLEMENTED", { projectId, correlationId, featureId, params });
      }

      // 4. Safety Limit
      if (files.length > ExecutionPolicy.maxFilesPerProject) {
        throw new Error(`Safety limit exceeded: max ${ExecutionPolicy.maxFilesPerProject} files per project.`);
      }

      // 4b. Write custom files
      logger.info({ msg: "writing_files", projectId, fileCount: files.length, correlationId });
      let createdCount = 0;
      for (const file of files) {
        await toolRegistry.callTool("write_file", {
          path: `${projectId}/${file.path}`,
          content: file.content
        });
        createdCount++;
      }
      eventBus.emit("FILES_WRITTEN", { projectId, correlationId, filesCreated: createdCount });

      // 5. Build Verification (classified)
      logger.info({ msg: "build_verification_start", projectId, correlationId });
      let buildStatus: BuildResult["status"] = "OK";
      try {
        const buildRes: BuildResult = await toolRegistry.callTool("validate_build", {
          projectId,
          command: "npx tsc --noEmit"
        });
        buildStatus = buildRes.status;
        eventBus.emit("BUILD_VERIFIED", { projectId, correlationId, result: buildRes });

        if (buildRes.status === "ERROR") {
          logger.warn({ msg: "build_error_blocking_deploy", projectId, correlationId });
        } else if (buildRes.status === "WARN") {
          logger.warn({ msg: "build_warn_dependencies_missing", projectId, correlationId });
        }
      } catch (buildErr: any) {
        logger.warn({ msg: "build_verification_skipped", projectId, correlationId, reason: buildErr.message });
        buildStatus = "WARN";
      }

      // 6. Deployment (gated by Policy AND build status)
      let deployUrl: string | undefined;
      const deployBlocked = buildStatus === "ERROR" && ExecutionPolicy.blockDeployOnBuildError;

      if (structure.shouldDeploy && !deployBlocked) {
        logger.info({ msg: "auto_deploy_start", projectId, correlationId });
        const deployRes = await toolRegistry.callTool("deploy_project", {
          projectId,
          provider: structure.deployProvider || "render"
        });
        if (deployRes.success) {
          deployUrl = deployRes.url;
        }
        // Infra layer notified via Event Bus
        eventBus.emit("DEPLOYMENT_COMPLETE", { projectId, correlationId, result: deployRes });
      } else if (structure.shouldDeploy && deployBlocked) {
        logger.warn({ msg: "deploy_skipped_build_error", projectId, correlationId });
      }

      // 7. Git Commit
      if (ExecutionPolicy.allowGitCommit) {
        await toolRegistry.callTool("git_commit", {
          projectId,
          message: `WADI: Materialization of ${structure.name} [${correlationId.slice(0, 8)}]`
        });
      }

      const logs: RunLogs = { filesCreated: createdCount, templateId, features, deployUrl };
      await this.endRun(runId, "SUCCESS", logs);

      // Notify all listeners — Infra can pick this up for metrics
      eventBus.emit("MATERIALIZATION_COMPLETE", {
        projectId,
        correlationId,
        success: true,
        filesCreated: createdCount,
        deployUrl
      });

      return { success: true, filesCreated: createdCount, deployUrl, correlationId };

    } catch (error: any) {
      logger.error({ msg: "materialization_failed", projectId, correlationId, error: error.message });
      await this.endRun(runId, "FAILED", {}, error.message);
      eventBus.emit("RUN_FAILED", { projectId, correlationId, step: "MATERIALIZATION", error: error.message });
      return { success: false, filesCreated: 0, correlationId };
    }
  }

  // ── Idempotency ─────────────────────────────────────────────────────────────

  private async isRunInProgress(projectId: string): Promise<boolean> {
    try {
      const { data } = await (supabase as any)
        .from("project_runs")
        .select("id")
        .eq("project_id", projectId)
        .eq("status", "IN_PROGRESS")
        .limit(1);
      return data && data.length > 0;
    } catch {
      return false; // Fail open: if we can't check, proceed
    }
  }

  // ── Run Lifecycle ────────────────────────────────────────────────────────────

  private async startRun(projectId: string, stepName: string, correlationId: string): Promise<string | null> {
    try {
      const { data, error } = await (supabase as any).from("project_runs").insert({
        project_id: projectId,
        step_name: stepName,
        status: "IN_PROGRESS",
        correlation_id: correlationId
      }).select().single();

      if (error || !data) {
        logger.warn({ msg: "start_run_no_id", projectId, correlationId, error: error?.message });
        return null;
      }
      return data.id;
    } catch {
      return null;
    }
  }

  private async endRun(runId: string | null, status: string, logs: RunLogs = {}, errorMessage?: string) {
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
