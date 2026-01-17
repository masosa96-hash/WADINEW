import { Router, Request, Response, NextFunction } from "express";
// In‑memory cache for persona stability per conversation
// Structure: { [conversationId]: { personaId: string; remainingTurns: number } }
const personaCache: Record<string, { personaId: string; remainingTurns: number }> = {};

// Helper to decide if a new persona is stronger than the cached one
const personaStrength: Record<string, number> = {
  "EJECUCION": 4,
  "CALMA": 3,
  "SERIO": 2,
  "IRONICO": 1,
};
function isStronger(newId: string, currentId: string): boolean {
  const newStrength = personaStrength[newId] ?? 0;
  const curStrength = personaStrength[currentId] ?? 0;
  return newStrength > curStrength;
}
// import { runBrain } from "@wadi/core";
// import { openai, AI_MODEL } from "./openai"; // Deprecated
import { smartLLM, fastLLM, AI_MODELS } from "./services/ai-service";
import { generateSystemPrompt, generateAuditPrompt, runBrainStream } from "./wadi-brain";
import { supabase as supabaseClient } from "./supabase";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = supabaseClient as any;
import { AppError, AuthError, ModelError } from "./core/errors";
import {
  validateChatInput,
  validateProjectInput,
  validateRunInput,
} from "./middleware/validation";
import { upload } from "./middleware/upload";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse");
// import { wadiPreFlight } from "./layers/human_pattern/index";
import { authenticate, AuthenticatedRequest } from "./middleware/auth";
import { requireScope } from "./middleware/require-scope";
import { getRelevantKnowledge } from "./services/knowledge-service";

const router = Router();

// Helper: Async Wrapper
const asyncHandler =
  (
    fn: (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => Promise<void | unknown>
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };

// The frontend I wrote waits for `response.json()` and looks for `response` or `message`.
// So direct response works. The job status endpoint is irrelevant for this new App.tsx.

// --- PROYECTOS (Simplificados) ---
router.get(
  "/projects",
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    res.json(data);
  })
);

router.post(
  "/projects",
  authenticate(),
  validateProjectInput,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { data } = await supabase
      .from("projects")
      .insert([{ ...req.body, user_id: user!.id
 }])
      .select()
      .single();
    res.json(data);
  })
);

// Helper: Generate Technical Project Name
const generateProjectName = async (description: string) => {
  try {
    const completion = await smartLLM.chat.completions.create({
      model: AI_MODELS.smart,
      messages: [
        {
          role: "system",
          content:
            "Generá un NOMBRE TÉCNICO ÚNICO (Max 35 chars) para este proyecto. Uppercase, snake_case. Sin extensión de archivo. EJ: SISTEMA_LOGISTICA_V1, RED_NEURONAL_BASE.",
        },
        { role: "user", content: description.substring(0, 500) },
      ],
      max_tokens: 20,
    });
    let name = completion.choices[0].message.content!.trim();
    // Sanitize
    name = name.replace(/[^A-Z0-9_]/g, "_").replace(/_{2,}/g, "_");
    return name;
  } catch (e) {
    return `PROYECTO_${Date.now()}`;
  }
};

router.post(
  "/projects/crystallize",
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { name, description } = req.body as any;

    if (!description || description.trim().length === 0) {
      throw new AppError(
        "MONDAY_REJECTION",
        "No puedo cristalizar la nada misma. Escribí una descripción."
      );
    }

    // Auto-generate name if missing
    if (!name || name.trim().length === 0) {
      name = await generateProjectName(description);
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          user_id: user!.id,
          name: name,
          description: description,
          status: "PLANNING",
        },
      ])
      .select()
      .single();

    if (error) throw new AppError("DB_ERROR", error.message);

    res.json(data);
  })
);

// Bulk Delete Projects
router.delete(
  "/projects/bulk",
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { projectIds } = req.body; // Array de UUIDs

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ error: "TL;DR: No mandaste IDs para borrar." });
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("user_id", user!.id) // Seguridad: solo borra proyectos del dueño
      .in("id", projectIds);

    if (error) return res.status(500).json({ error: "F: Error en la base de datos." });
    return res.status(200).json({ message: "Proyectos eliminados con éxito." });
  })
);

router.delete(
  "/projects/:id",
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;
    await supabase
      .from("projects")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", user!.id);
    res.json({ success: true });
  })
);

// Conversations list
router.get(
  "/conversations",
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user!.id)
      .order("updated_at", { ascending: false });
    res.json(data);
  })
);

router.delete(
  "/conversations/:id",
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;
    await supabase
      .from("conversations")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", user!.id);
    res.json({ success: true });
  })
);

// 1.6 Get Single Conversation (with messages)
router.get(
  "/conversations/:id",
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { id } = req.params;

    // Obtener metadatos de la conversación
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single();

    if (convError || !conversation) {
      throw new AppError("NOT_FOUND", "Conversación no encontrada", 404); // Assuming AppError handles this signature or existing error handler does
    }

    // Obtener los mensajes vinculados
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgError) throw new AppError("DB_ERROR", msgError.message);

    res.json({ ...conversation, messages });
  })
);

// Bulk Delete Conversations
router.delete(
  "/conversations/bulk",
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { conversationIds } = req.body; // Recibe ["id1", "id2", ...]

    if (!conversationIds || !Array.isArray(conversationIds) || conversationIds.length === 0) {
      // User specified error message
      return res.status(400).json({ error: "TL;DR: Mandame un array de IDs válido." });
    }

    const { error } = await supabase
      .from("conversations")
      .delete()
      .in("id", conversationIds)
      .eq("user_id", user!.id);

    if (error) {
      // User specified error message
      return res.status(500).json({ error: "F en el chat: No se pudo limpiar el caos." });
    }

    // User specified success message
    res.status(200).json({ message: "Workspace limpio. Del caos al plan." });
  })
);

// Update User Preferences
router.patch(
  "/user/preferences",
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { language, theme, naturalness_level, active_persona, custom_instructions } = req.body;

    // We'll update the 'profiles' table.
    const updates: any = {};
    if (language !== undefined) updates.language = language;
    if (theme !== undefined) updates.theme = theme;
    if (custom_instructions !== undefined) updates.custom_instructions = custom_instructions;
    
    // New fields for WADI personality control
    if (naturalness_level !== undefined) updates.naturalness_level = naturalness_level;
    if (active_persona !== undefined) updates.active_persona = active_persona;
    
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user!.id);

    if (error) {
       console.warn("Error updating profile preferences:", error.message);
       // We don't throw to avoid blocking the UI if columns are missing in dev
    }

    res.json({ success: true, updates });
  })
);

// ------------------------------------------------------------------
// DOCUMENT INTAKE (Intake & RAG Phase 1)
// ------------------------------------------------------------------
router.post(
  "/documents/upload",
  authenticate(),
  upload.single("file"),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = req.user;

    if (!req.file) {
      throw new AppError(
        "BAD_REQUEST",
        "No enviaste ningún archivo. ¿Es una broma?",
        400
      );
    }

    let textContent = "";

    try {
      if (req.file.mimetype === "application/pdf") {
        const data = await pdf(req.file.buffer);
        textContent = data.text;
      } else {
        // Text / Markdown
        textContent = req.file.buffer.toString("utf-8");
      }
    } catch (e) {
      console.error("Error parsing document:", e);
      throw new AppError(
        "UNPROCESSABLE_ENTITY",
        "No pude leer ese archivo. Probablemente esté corrupto como tu moral.",
        422
      );
    }

    // Clean text lightly
    textContent = textContent.replace(/\s+/g, " ").trim();

    // Check token count estimation (rough)
    const estimatedTokens = textContent.length / 4;

    // --- RAG INGESTION ---
    let ingestionResult;
    try {
        const { ingestDocument } = await import("@wadi/core");
        // We use the same Supabase client as API? No, Core manages its own or we pass it.
        // It's cleaner to let Core use its env, but ensuring consistency.
        // For now relying on Core's internal client creation via Env.
        
        ingestionResult = await ingestDocument(textContent, {
            userId: user!.id,
            metadata: {
                filename: req.file.originalname,
                mimetype: req.file.mimetype,
                uploaded_at: new Date().toISOString()
            }
        });
    } catch (e: any) {
        console.error("Ingestion failed", e);
        throw new AppError("INTERNAL_ERROR", "Error guardando en memoria vectorial: " + e.message);
    }

    res.json({
      filename: req.file.originalname,
      // content: textContent, // Don't echo back huge text
      size: req.file.size,
      tokens: Math.round(estimatedTokens),
      chunks: ingestionResult?.chunks || 0,
      message: `Archivo procesado e ingestad en ${ingestionResult?.chunks} fragmentos. Ahora es parte de mi consciencia.`,
    });
  })
);

// Helper: Fetch Knowledge Base
const fetchKnowledgeBase = async (userId: string) => {
  try {
    const { data } = await supabase
      .from("wadi_knowledge_base")
      .select("category, point")
      .eq("user_id", userId)
      .order("confidence_score", { ascending: false })
      .limit(5); // Top 5 insights
    return data || [];
  } catch (e) {
    return [];
  }
};

// --- MEMORY DISTILLER ---
router.post(
  "/memory/reflect",
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;

    // 1. Get recent unsynthesized messages
    // (For this V4, we just take the last 20 messages of the user to find patterns)
    const { data: recentMsgs } = await supabase
      .from("messages")
      .select("role, content")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!recentMsgs || recentMsgs.length < 5) {
      return res.json({ message: "Not enough data to reflect." });
    }

    const conversationText = recentMsgs
      .reverse()
      .map((m: any) => `${m.role}: ${m.content}`)
      .join("\n");

    // 2. Ask AI to distill knowledge
    const completion = await smartLLM.chat.completions.create({
      model: AI_MODELS.smart,
      messages: [
        {
          role: "system",
          content: `Sos el Subconsciente de WADI. Tu trabajo es analizar chats y extraer "Hechos de Conocimiento" sobre el usuario para mejorar futuras interacciones.
          
          Output JSON Array:
          [
            {"point": "Usa mucho TypeScript y odia los any", "category": "PREFERENCE"},
            {"point": "Suele trabajar de noche", "category": "PATTERN"}
          ]
          
          Extraé máximo 3 puntos. Si no hay nada relevante, devolvé array vacío.
          IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON. Prohibido usar bloques de código Markdown (\`\`\`) o negritas (**). Solo el array JSON raw.`,
        },
        { role: "user", content: conversationText },
      ],
    });

    let rawContent = completion.choices[0].message.content || "[]";
    // Remove markdown block if present
    rawContent = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let insights: any[] = [];
    try {
      insights = JSON.parse(rawContent);
    } catch (e) {
      console.error("JSON Parse Error in Reflection", e);
      // Fallback: Try to save crude text if possible, or just fail gracefully.
      // For now, fail gracefully to avoid corrupt data.
      insights = [];
    }

    // 3. Store in Knowledge Base & Reflections
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newReflections: any[] = [];

    for (const insight of insights) {
      // Check duplicate loosely (optional, skipping for speed)
      await supabase.from("wadi_knowledge_base").insert({
        user_id: user!.id,
        knowledge_point: insight.point,
        category: insight.category,
      });

      // Add to Inner Sanctum Report
      const { data: reflect } = await supabase
        .from("wadi_reflections")
        .insert({
          user_id: user!.id,
          type: "APRENDIZAJE",
          content: `Detectado: ${insight.point} (${insight.category})`,
          priority: "NORMAL",
        })
        .select()
        .single();

      newReflections.push(reflect);
    }

    res.json({ success: true, reflections: newReflections });
  })
);

// --- INNER SANCTUM ---
router.get(
  "/inner-sanctum/reports",
  authenticate(),
  requireScope("admin:*"),
  asyncHandler(async (req, res) => {
    const { data } = await supabase
      .from("wadi_reflections")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    res.json(data);
  })
);

// --- ARCHIVE & CLEAR (LIMPIAR MESA) ---
router.post(
  "/inner-sanctum/archive",
  authenticate(),
  requireScope("admin:*"),
  asyncHandler(async (req, res) => {
    const user = req.user;

    // 1. Fetch current reflections
    const { data: reflections } = await supabase
      .from("wadi_reflections")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true });

    if (!reflections || reflections.length === 0) {
      return res.json({ message: "Nada que archivar." });
    }

    // 2. Format as Markdown
    const dateStr = new Date().toISOString().split("T")[0];
    let fileContent = `# WADI EVOLUTION LOG [${dateStr}]\n\n`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reflections.forEach((r: any) => {
      fileContent += `## [${r.type}] ${new Date(r.created_at).toLocaleTimeString()}\n`;
      fileContent += `Priority: ${r.priority}\n`;
      fileContent += `${r.content}\n\n---\n\n`;
    });

    // 3. Save to Cloud Reports
    const fileName = `${dateStr}_evolution_log_${Date.now()}.txt`;
    await (supabase.from("wadi_cloud_reports") as any).insert({
      user_id: user!.id,
      name: fileName,
      content: fileContent,
      type: "EVOLUTION_LOG",
    });

    // 4. Clear Reflections (Limpiar Mesa)
    await supabase.from("wadi_reflections").delete().eq("user_id", user!.id);

    res.json({ success: true, archivedFile: fileName });
  })
);

// --- CRYSTALLIZE ENDPOINT ---
router.post(
  "/projects/crystallize",
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { message, suggestionContent } = req.body;
    
// 1. Generate Project Details using LLM
    const completion = await smartLLM.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: "Sos un arquitecto de software experto. Tu trabajo es 'cristalizar' ideas vagas en proyectos técnicos concretos." },
            { role: "user", content: `Transforma esto en un proyecto técnico (Nombre corto, Descripción profesional, 3 tareas iniciales): "${suggestionContent || message}"` }
        ],
        response_format: { type: "json_object" },
        functions: [
            {
                name: "create_project_structure",
                parameters: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        tasks: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "description", "tasks"]
                }
            }
        ],
        function_call: { name: "create_project_structure" }
    });

    const args = JSON.parse(completion.choices[0].message.function_call?.arguments || "{}");
    
    // 2. Insert Project (Assuming 'projects' table matched expected schema)
    const { data: project, error: projError } = await supabase
        .from("projects")
        .insert({
            user_id: user!.id,
            name: args.name,
            description: args.description,
            status: 'PLANNING'
        })
        .select()
        .single();

    if (projError) throw new Error("Error creating project: " + projError.message);

    res.json({
        project,
        initialTasks: args.tasks
    });
  })
);

router.get(
    "/projects/suggestions/pending",
    authenticate(),
    asyncHandler(async (req, res) => {
        const user = req.user;
        // Fetch recent suggestions from knowledge base
        const { data } = await supabase
            .from('wadi_knowledge_base')
            .select('*')
            .eq('user_id', user!.id)
            .eq('category', 'PROJECT_SUGGESTION')
            .order('created_at', { ascending: false })
            .limit(1);
        
        // Helper logic: Return only if created in last 2 minutes to act as a "trigger"
        // Or just return the latest and let frontend decide if it showed it already.
        res.json(data || []);
    })
);

// --- JOURNAL (CLOUD LOGS) ---
router.get(
  "/journal/files",
  authenticate(),
  requireScope("admin:*"),
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { data } = await supabase
      .from("wadi_cloud_reports")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    res.json(data);
  })
);

// [DEBUG] Get Current System Prompt
router.post(
  "/debug/system-prompt",
  asyncHandler(async (req, res) => {
    const { mode, topic, explainLevel, isMobile, messageCount } = req.body;

    // Generate prompt with mock or provided data
    const { prompt } = generateSystemPrompt(
      mode || "normal",
      topic || "general",
      // explainLevel || "normal",
      {},
      "hostile",
      isMobile || false,
      messageCount || 0,
      [], // pastFailures mocked
      "GENERADOR_DE_HUMO", // rank mocked
      0, // points mocked
      null // active_focus mocked
    );

    res.json({ prompt });
  })
);

export default router;
