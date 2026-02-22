import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "../../core/logger";
import { toolRegistry } from "../tool-registry";

const execAsync = promisify(exec);

/**
 * Security safeguard: only run allowed commands
 */
const ALLOWED_COMMANDS = ["npm run build", "npm run lint", "npx tsc --noEmit"];
const WORKSPACE_ROOT = "e:\\WADINEW";

toolRegistry.registerTool(
  {
    name: "validate_build",
    description: "Ejecuta un comando de validación (build o lint) para verificar la calidad del código generado.",
    parameters: {
      type: "object",
      properties: {
        command: { 
          type: "string", 
          enum: ALLOWED_COMMANDS,
          description: "El comando de validación a ejecutar" 
        }
      },
      required: ["command"]
    }
  },
  async ({ command }) => {
    try {
      logger.info({ msg: "executing_validation", command });
      
      const { stdout, stderr } = await execAsync(command, { cwd: WORKSPACE_ROOT });
      
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
