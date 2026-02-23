import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "../../core/logger";
import { toolRegistry } from "../tool-registry";
import type { BuildResult } from "../../types/domain";

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
    description: "Ejecuta un comando de validación y retorna un resultado clasificado (OK/WARN/ERROR/RISK).",
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
  async ({ projectId, command }): Promise<BuildResult> => {
    try {
      const projectRoot = validateProjectPath(projectId);
      logger.info({ msg: "executing_validation", projectId, command });
      
      const { stdout, stderr } = await execAsync(command, { cwd: projectRoot });
      
      return {
        status: "OK",
        output: stdout
      };
    } catch (error: any) {
      const stderr: string = error.stderr || error.message || "";
      const stdout: string = error.stdout || "";

      // Classify the failure
      const isDependencyMissing = 
        stderr.includes("Cannot find module") || 
        stderr.includes("MODULE_NOT_FOUND") ||
        stderr.includes("not found") ||
        stderr.includes("not installed");

      const isTypeScriptError = 
        stderr.includes("error TS") || 
        stdout.includes("error TS") ||
        stderr.includes("TypeScript");

      if (isDependencyMissing && !isTypeScriptError) {
        logger.warn({ msg: "build_warn_dependencies", projectId });
        return {
          status: "WARN",
          reason: "dependencies_missing",
          details: stderr,
          output: stdout
        };
      }

      if (isTypeScriptError) {
        logger.warn({ msg: "build_error_typescript", projectId, details: stderr });
        return {
          status: "ERROR",
          reason: "typescript_errors",
          details: stderr,
          output: stdout
        };
      }

      // Default: generic risk
      logger.warn({ msg: "build_risk_generic", projectId });
      return {
        status: "RISK",
        reason: "tests_failed",
        details: stderr,
        output: stdout
      };
    }
  }
);
