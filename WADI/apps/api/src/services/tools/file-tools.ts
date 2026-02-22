import * as fs from "fs/promises";
import * as path from "path";
import { logger } from "../../core/logger";
import { toolRegistry } from "../tool-registry";

/**
 * Security safeguard: ensure paths are within the workspace
 */
const WORKSPACE_ROOT = path.resolve("e:\\WADINEW");
const PROJECTS_ROOT = path.resolve(WORKSPACE_ROOT, "projects");

export function validatePath(targetPath: string) {
  // 1. Normalize and resolve to absolute
  const absolutePath = path.resolve(PROJECTS_ROOT, targetPath);
  
  // 2. Security check: Must be inside PROJECTS_ROOT and NOT WORKSPACE_ROOT (api itself)
  if (!absolutePath.startsWith(PROJECTS_ROOT)) {
    logger.error({ msg: "security_violation_path_traversal", path: targetPath, resolved: absolutePath });
    throw new Error(`Access denied: path ${targetPath} is outside the allowed projects directory.`);
  }
  
  return absolutePath;
}

// ─── CodeWriter Tools Registration ───────────────────────────────────────────

toolRegistry.registerTool(
  {
    name: "write_file",
    description: "Escribe contenido en un archivo. Úsalo para generar código o configuraciones.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Ruta relativa dentro del proyecto" },
        content: { type: "string", description: "Contenido completo del archivo" }
      },
      required: ["path", "content"]
    }
  },
  async ({ path: relPath, content }) => {
    try {
      const fullPath = validatePath(relPath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, "utf-8");
      
      logger.info({ msg: "file_written", path: relPath });
      return { success: true, path: relPath };
    } catch (error: any) {
      logger.error({ msg: "write_file_failed", path: relPath, error: error.message });
      throw error;
    }
  }
);

toolRegistry.registerTool(
  {
    name: "create_directory",
    description: "Crea un directorio de forma recursiva.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Ruta relativa del directorio" }
      },
      required: ["path"]
    }
  },
  async ({ path: relPath }) => {
    try {
      const fullPath = validatePath(relPath);
      await fs.mkdir(fullPath, { recursive: true });
      
      logger.info({ msg: "directory_created", path: relPath });
      return { success: true, path: relPath };
    } catch (error: any) {
      logger.error({ msg: "create_directory_failed", path: relPath, error: error.message });
      throw error;
    }
  }
);

toolRegistry.registerTool(
  {
    name: "list_project_files",
    description: "Lista archivos en el directorio del proyecto para entender la estructura actual.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Ruta relativa a listar (opcional)", default: "." }
      }
    }
  },
  async ({ path: relPath = "." }) => {
    try {
      const fullPath = validatePath(relPath);
      const files = await fs.readdir(fullPath, { withFileTypes: true });
      
      return {
        path: relPath,
        items: files.map(f => ({
          name: f.name,
          type: f.isDirectory() ? "directory" : "file"
        }))
      };
    } catch (error: any) {
      logger.error({ msg: "list_files_failed", path: relPath, error: error.message });
      throw error;
    }
  }
);
