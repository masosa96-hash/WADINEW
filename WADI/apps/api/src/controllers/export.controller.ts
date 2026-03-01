import { Response, NextFunction } from "express";
import { supabase } from "../supabase";
import { AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth";

export const exportProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.id as any;
  const format = req.query.format || "markdown"; // markdown or json

  const { data: project, error: fetchError } = await (supabase as any)
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !project) throw new AppError("NOT_FOUND", "Proyecto no encontrado");

  if (format === "json") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${project.name}.json"`);
    return res.json(project);
  }

  // Markdown Export Task
  const struct = project.structure || {};
  const prdSection = project.prd ? `\n## PRD\n${project.prd}\n` : "";
  
  const markdown = `# ${project.name}
  
> **Estado:** ${project.status}
> **Creado:** ${new Date(project.created_at).toLocaleDateString()}

## Descripción
${project.description}

## Estructura Operacional
- **Problema:** ${struct.problem || "N/A"}
- **Solución:** ${struct.solution || "N/A"}
- **Target (ICP):** ${struct.target_icp || "N/A"}
- **Propuesta de Valor:** ${struct.value_proposition || "N/A"}
- **Recommended Stack:** ${struct.recommended_stack || "N/A"}

### Milestones
${(struct.milestones || []).map((m: string) => `- [ ] ${m}`).join("\n")}

### Riesgos Críticos
${(struct.risks || []).map((r: string) => `- [!] ${r}`).join("\n")}

### Próximos Pasos (Validación)
${(struct.validation_steps || []).map((v: string) => `- ${v}`).join("\n")}

${struct.terminal_commands ? `### Comandos de Terminal\n\`\`\`bash\n${struct.terminal_commands.join("\n")}\n\`\`\`` : ""}

${prdSection}

---
*Generado por WADI (Socio Operacional AI)*
`;

  res.setHeader("Content-Type", "text/markdown");
  res.setHeader("Content-Disposition", `attachment; filename="${project.name}.md"`);
  res.send(markdown);
};
