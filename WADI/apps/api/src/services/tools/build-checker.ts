import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "../../core/logger";
import { toolRegistry } from "../tool-registry";

import * as path from "path";

const execAsync = promisify(exec);

/**
 * Security safeguard: only run allowed commands
 */
const ALLOWED_COMMANDS = ["npm run build", "npm run lint", "npx tsc --noEmit", "npm install --no-save"];
const WORKSPACE_ROOT = path.resolve("e:\\WADINEW");
const PROJECTS_ROOT = path.resolve(WORKSPACE_ROOT, "projects");

function validateProjectPath(projectId: string) {
  const absolutePath = path.resolve(PROJECTS_ROOT, projectId);
  if (!absolutePath.startsWith(PROJECTS_ROOT)) {
    throw new Error("Access denied: Invalid project ID");
  }
  return absolutePath;
}

toolRegistry.registerTool(
  {
    name: "validate_build",
    description: "Ejecuta un comando de validación (build o lint) para verificar la calidad del código generado.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "ID del proyecto" },
        command: { 
          type: "string", 
          enum: ALLOWED_COMMANDS,
          description: "El comando de validación a ejecutar" 
        }
      },
      required: ["projectId", "command"]
    }
  },
  async ({ projectId, command }) => {
    try {
      const projectRoot = validateProjectPath(projectId);
      logger.info({ msg: "executing_validation", projectId, command });
      
      const { stdout, stderr } = await execAsync(command, { cwd: projectRoot });
      
      return {
        success: true,
        output: stdout,
        errors: stderr
      };
    } catch (error: any) {
      logger.warn({ msg: "validation_failed", command, error: error.message });
      return {
        success: false,
        output: error.stdout,
        errors: error.stderr || error.message
      };
    }
  }
);
