import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import { logger } from "../../core/logger";
import { toolRegistry } from "../tool-registry";

const execAsync = promisify(exec);
const WORKSPACE_ROOT = path.resolve("e:\\WADINEW");
const PROJECTS_ROOT = path.resolve(WORKSPACE_ROOT, "projects");

/**
 * Validates that git commands only run within a project subdirectory
 */
function getProjectGitRoot(projectId: string): string {
  const projectPath = path.resolve(PROJECTS_ROOT, projectId);
  if (!projectPath.startsWith(PROJECTS_ROOT)) {
    throw new Error("Invalid project ID for git operation");
  }
  return projectPath;
}

toolRegistry.registerTool(
  {
    name: "git_commit",
    description: "Realiza un commit en el repositorio específico de un proyecto.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "ID del proyecto" },
        message: { type: "string", description: "Mensaje de commit" }
      },
      required: ["projectId", "message"]
    }
  },
  async ({ projectId, message }) => {
    try {
      const projectRoot = getProjectGitRoot(projectId);
      logger.info({ msg: "git_commit_start", projectId, message });
      
      // 1. Initial check: Is it a git repo?
      try {
        await execAsync("git rev-parse --is-inside-work-tree", { cwd: projectRoot });
      } catch {
        // Init repo if not exists
        await execAsync("git init", { cwd: projectRoot });
      }

      // 2. Add and commit
      await execAsync("git add .", { cwd: projectRoot });
      const { stdout } = await execAsync(`git commit -m "${message}"`, { cwd: projectRoot });
      
      logger.info({ msg: "git_commit_success", projectId });
      return { success: true, output: stdout };
    } catch (error: any) {
      if (error.message.includes("nothing to commit")) {
        return { success: true, output: "Nothing to commit, working tree clean." };
      }
      logger.error({ msg: "git_commit_failed", projectId, error: error.message });
      throw error;
    }
  }
);

toolRegistry.registerTool(
  {
    name: "git_status",
    description: "Muestra el estado actual del repositorio (archivos modificados, nuevos, etc).",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  async () => {
    try {
      const { stdout } = await execAsync("git status --porcelain", { cwd: WORKSPACE_ROOT });
      return { status: stdout || "Clean" };
    } catch (error: any) {
      logger.error({ msg: "git_status_failed", error: error.message });
      throw error;
    }
  }
);
