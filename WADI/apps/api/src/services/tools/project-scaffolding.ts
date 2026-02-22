import { toolRegistry } from "../tool-registry";
import { templateService } from "../templates/template-service";
import { logger } from "../../core/logger";

toolRegistry.registerTool(
  {
    name: "initialize_scaffolding",
    description: "Inicializa un proyecto con un esqueleto base (Next.js, Vite, Node).",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "ID del proyecto" },
        templateId: { 
          type: "string", 
          enum: ["nextjs-tailwind", "vite-react-ts"],
          description: "ID del template base a usar" 
        }
      },
      required: ["projectId", "templateId"]
    }
  },
  async ({ projectId, templateId }) => {
    try {
      const template = templateService.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      logger.info({ msg: "scaffolding_init", projectId, template: templateId });

      for (const file of template.baseFiles) {
        await toolRegistry.callTool("write_file", {
          path: `${projectId}/${file.path}`,
          content: file.content
        });
      }

      return { success: true, filesCreated: template.baseFiles.length };
    } catch (error: any) {
      logger.error({ msg: "scaffolding_failed", projectId, error: error.message });
      throw error;
    }
  }
);
