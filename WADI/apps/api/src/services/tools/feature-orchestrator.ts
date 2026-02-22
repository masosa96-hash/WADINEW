import { toolRegistry } from "../tool-registry";
import { featureService } from "../features/feature-service";
import { logger } from "../../core/logger";

toolRegistry.registerTool(
  {
    name: "implement_feature",
    description: "Implementa una funcionalidad completa que requiere cambios en múltiples archivos coordinados.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "ID del proyecto" },
        featureId: { 
          type: "string", 
          enum: ["basic-auth", "drizzle-postgres", "basic-crud"],
          description: "ID de la funcionalidad a implementar" 
        },
        params: {
          type: "object",
          additionalProperties: { type: "string" },
          description: "Parámetros opcionales para la funcionalidad (ej: entityName)"
        }
      },
      required: ["projectId", "featureId"]
    }
  },
  async ({ projectId, featureId, params }) => {
    try {
      const recipe = featureService.getRecipe(featureId, params || {});
      if (!recipe) {
        throw new Error(`Feature recipe ${featureId} not found`);
      }

      logger.info({ msg: "feature_implementation_start", projectId, feature: featureId });

      for (const change of recipe.changes) {
        if (change.action === "create" || change.action === "modify") {
          await toolRegistry.callTool("write_file", {
            path: `${projectId}/${change.path}`,
            content: change.content
          });
        }
        // Deletion skip for now as per minimal implementation
      }

      return { success: true, changesApplied: recipe.changes.length };
    } catch (error: any) {
      logger.error({ msg: "feature_implementation_failed", projectId, error: error.message });
      throw error;
    }
  }
);
