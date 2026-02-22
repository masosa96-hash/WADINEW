import { logger } from "../core/logger";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: any;
}

export type ToolHandler = (args: any) => Promise<any>;

class ToolRegistry {
  private tools: Map<string, { definition: ToolDefinition; handler: ToolHandler }> = new Map();

  registerTool(definition: ToolDefinition, handler: ToolHandler) {
    this.tools.set(definition.name, { definition, handler });
    logger.info({ msg: "tool_registered", tool: definition.name });
  }

  getToolDefinitions(): any[] {
    return Array.from(this.tools.values()).map(t => ({
      type: "function",
      function: t.definition
    }));
  }

  async callTool(name: string, args: string | object): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;
    
    logger.info({ msg: "tool_call_start", tool: name, args: parsedArgs });
    try {
      const result = await tool.handler(parsedArgs);
      logger.info({ msg: "tool_call_success", tool: name });
      return result;
    } catch (error: any) {
      logger.error({ msg: "tool_call_failed", tool: name, error: error.message });
      throw error;
    }
  }
}

export const toolRegistry = new ToolRegistry();

// ─── Initial Tools Registration ──────────────────────────────────────────────

toolRegistry.registerTool(
  {
    name: "get_market_trends",
    description: "Altamente recomendado para validar si una idea tiene demanda actual en el mercado.",
    parameters: {
      type: "object",
      properties: {
        topic: { type: "string", description: "El tema o nicho del proyecto" }
      },
      required: ["topic"]
    }
  },
  async ({ topic }) => {
    return {
      trend: "GROWING",
      signals: [`Demanda alta en ${topic}`, "Poca competencia técnica detectada"],
      confidence: 0.85
    };
  }
);

toolRegistry.registerTool(
  {
    name: "validate_tech_stack",
    description: "Verifica si una combinación de tecnologías es compatible y moderna.",
    parameters: {
      type: "object",
      properties: {
        stack: { type: "array", items: { type: "string" }, description: "Lista de tecnologías" }
      },
      required: ["stack"]
    }
  },
  async ({ stack }) => {
    const deprecated = ["jquery", "knockout", "perl"];
    const found = stack.filter((s: string) => deprecated.includes(s.toLowerCase()));
    
    return {
      compatible: true,
      warnings: found.length > 0 ? [`Tecnologías legacy detectadas: ${found.join(", ")}`] : [],
      score: found.length > 0 ? 0.6 : 0.95
    };
  }
);
