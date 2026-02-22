import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "../../core/logger";
import { toolRegistry } from "../tool-registry";

const execAsync = promisify(exec);
const WORKSPACE_ROOT = "e:\\WADINEW";

toolRegistry.registerTool(
  {
    name: "git_commit",
    description: "Realiza un commit de todos los cambios actuales en el workspace con un mensaje descriptivo.",
    parameters: {
      type: "object",
      properties: {
        message: { type: "string", description: "Mensaje de commit (ej. '[WADI] Scaffolded project skeleton')" }
      },
      required: ["message"]
    }
  },
  async ({ message }) => {
    try {
      logger.info({ msg: "git_commit_start", message });
      
      // 1. Add all
      await execAsync("git add .", { cwd: WORKSPACE_ROOT });
      
      // 2. Commit
      const { stdout } = await execAsync(`git commit -m "${message}"`, { cwd: WORKSPACE_ROOT });
      
      logger.info({ msg: "git_commit_success" });
      return { success: true, output: stdout };
    } catch (error: any) {
      // If nothing to commit, it's not really a failure for WADI
      if (error.message.includes("nothing to commit")) {
        return { success: true, output: "Nothing to commit, working tree clean." };
      }
      
      logger.error({ msg: "git_commit_failed", error: error.message });
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
