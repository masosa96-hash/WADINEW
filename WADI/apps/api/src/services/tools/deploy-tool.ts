import { toolRegistry } from "../tool-registry";
import { deployService } from "../deploy/deploy-service";
import { logger } from "../../core/logger";

toolRegistry.registerTool(
  {
    name: "deploy_project",
    description: "Despliega un proyecto materializado a la nube (Render/Vercel).",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "ID del proyecto a desplegar" },
        provider: { 
          type: "string", 
          enum: ["render", "vercel"],
          description: "Proveedor de nube seleccionado" 
        }
      },
      required: ["projectId"]
    }
  },
  async ({ projectId, provider = "render" }) => {
    try {
      const result = await deployService.deploy(projectId, provider as any);
      return result;
    } catch (error: any) {
      logger.error({ msg: "deploy_tool_failed", projectId, error: error.message });
      throw error;
    }
  }
);
