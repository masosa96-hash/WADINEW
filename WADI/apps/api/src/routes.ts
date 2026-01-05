import { Router, Request, Response, NextFunction } from "express";
import { runBrain } from "@wadi/core";
import { openai, AI_MODEL } from "./openai.js";
import { generateSystemPrompt, generateAuditPrompt } from "./wadi-brain.js";
import { supabase } from "./supabase.js";
import { AppError, AuthError, ModelError } from "./core/errors.js";
import {
  validateChatInput,
  validateProjectInput,
  validateRunInput,
} from "./middleware/validation.js";
import { upload } from "./middleware/upload.js";
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse");
import { wadiPreFlight } from "./layers/human_pattern/index.js";
import { authenticate } from "./middleware/authenticate.js";
import { requireScope } from "./middleware/require-scope.js";
import { chatQueue } from "./queue/chatQueue.js";

interface AuthenticatedRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
  file?: Express.Multer.File;
}

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

// Helper: Process attachments for OpenAI
const processAttachments = async (message: string, attachments: any[]) => {
  if (!attachments || attachments.length === 0) return message;

  // Si hay adjuntos, preparamos el contenido estructurado
  const content: any[] = [{ type: "text", text: message }];

  attachments.forEach((att) => {
    const url = typeof att === "string" ? att : att.url;
    if (url && (url.startsWith("data:image") || url.includes("supabase"))) {
      content.push({ type: "image_url", image_url: { url } });
    }
  });

  return content;
};

// Helper: Fetch Past Failures (Long Term Memory)
const fetchUserCriminalRecord = async (userId: string) => {
  try {
    const { data: audits } = await supabase
      .from("messages")
      .select("content, created_at")
      .eq("user_id", userId)
      .eq("role", "system")
      .ilike("content", "[AUDIT_LOG_V1]%")
      .order("created_at", { ascending: false })
      .limit(3);

    if (!audits || audits.length === 0) return [];
    let failures: string[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const audit of audits as any[]) {
      try {
        const jsonPart = audit.content.replace("[AUDIT_LOG_V1]\n", "");
        const parsed = JSON.parse(jsonPart);
        const dateStr = new Date(audit.created_at).toISOString().split("T")[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const highRisk = (parsed.vulnerabilities || [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((v: any) => v.level === "HIGH")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((v: any) => `${v.title} (${dateStr})`);
        failures = [...failures, ...highRisk];
      } catch (e) {
        console.error("Memory parse error", e);
      }
    }
    return [...new Set(failures)].slice(0, 3);
  } catch (err) {
    return [];
  }
};

const calculateRank = (points: number) => {
  if (points >= 801) return "ENTIDAD_DE_ORDEN";
  if (points >= 401) return "ESTRATEGA_JUNIOR";
  if (points >= 101) return "CIVIL_PROMEDIO";
  return "GENERADOR_DE_HUMO";
};

// --- ROUTES ---

// --- ROUTES ---

router.get(
  "/user/criminal-summary",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = req.user;

    const { data: audits } = await supabase
      .from("messages")
      .select("content")
      .eq("user_id", user.id)
      .eq("role", "system")
      .ilike("content", "[AUDIT_LOG_V1]%");

    let totalHighRisks = 0;
    if (audits) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audits.forEach((audit: any) => {
        try {
          const parsed = JSON.parse(
            audit.content.replace("[AUDIT_LOG_V1]\n", "")
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          totalHighRisks += (parsed.vulnerabilities || []).filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (v: any) => v.level === "HIGH"
          ).length;
        } catch (e) {}
      });
    }
    res.json({ totalAudits: audits?.length || 0, totalHighRisks });
  })
);

router.post(
  "/user/admit-failure",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = req.user;

    const { data: profile } = await supabase
      .from("profiles")
      .select("efficiency_points")
      .eq("id", user.id)
      .maybeSingle();
    const newPoints = profile?.efficiency_points || 0; // No penalty, just reset state
    const newRank = calculateRank(newPoints);

    await supabase.from("profiles").upsert({
      id: user.id,
      active_focus: null,
      efficiency_points: newPoints,
      efficiency_rank: newRank,
      updated_at: new Date().toISOString(),
    });

    res.json({
      reply:
        "Está bien. A veces el plan se rompe y lo más inteligente es soltarlo antes de que nos hunda a los dos. Perdimos un poco de impulso, pero recuperamos la claridad. Borrón y cuenta nueva. ¿Qué tenemos en la cabeza ahora?",
      efficiencyPoints: newPoints,
      efficiencyRank: newRank,
    });
  })
);

// In-memory store for guest sessions (Volatile)
// In-memory store for guest sessions (Volatile)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const guestSessions = new Map<string, any[]>();

// --- REPLACED: ASYNC CHAT ENDPOINT ---
router.post(
  "/chat",
  authenticate,
  validateChatInput,
  requireScope("chat:write"),
  asyncHandler(async (req, res) => {
    let user = req.user;
    
    // Fallback for missing user in request (should be handled by authenticate/requireScope, but for safety)
    const userId = user?.id || "anonymous_" + Date.now();

    const {
      message,
      conversationId,
      mode,
      explainLevel,
      topic,
      attachments,
      isMobile,
      customSystemPrompt,
      memory
    } = req.body;

    let currentConversationId = conversationId;

    // 1. Create Conversation if needed (SYC, before queueing)
    if (user && !currentConversationId) {
       const { data: newConv } = await supabase
          .from("conversations")
          .insert([
            {
              user_id: user.id,
              title: message.substring(0, 60),
              mode: mode || "normal",
              explain_level: explainLevel || "normal",
            },
          ])
          .select()
          .single();
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         currentConversationId = (newConv as any).id;
    }

    // 2. Insert User Message immediately so it appears secure
    if (user && currentConversationId) {
        await supabase.from("messages").insert({
            conversation_id: currentConversationId,
            user_id: user.id,
            role: "user",
            content: message,
            attachments: attachments || [],
        });
    }

    // --- CONTEXT GATHERING (Restored from Sync Version) ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let history: any[] = [];
    let profile = {
      efficiency_rank: "VISITANTE",
      efficiency_points: 0,
      active_focus: null,
      custom_instructions: null,
    };
    let pastFailures: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let knowledgeBase: any[] = [];

    if (user && currentConversationId) {
       // Fetch History
       const { data: dbHistory } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", currentConversationId)
        .order("created_at", { ascending: true });
      history = dbHistory || [];
      
      // Safety: ensure current msg is in history if DB race condition
       if (history.length === 0 || history[history.length - 1].content !== message) {
         history.push({ role: "user", content: message });
       }

       // Fetch Profile
       const { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (dbProfile) profile = dbProfile;

      // Fetch Memory
      pastFailures = await fetchUserCriminalRecord(user.id);
      knowledgeBase = await fetchKnowledgeBase(user.id);
    } else {
        history.push({ role: "user", content: message });
    }

    // --- GENERATE SYSTEM PROMPT & MESSAGES ---
    // Remove current msg from history for prompt context (it's added at the end)
    const previousHistory = history.slice(0, -1).slice(-20);
    const messageCount = Math.max(0, history.length - 1);

     const fullSystemPrompt = generateSystemPrompt(
      mode || "normal",
      topic || "general",
      {}, // sessionPrefs
      "hostile",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req.body as any).isMobile,
      messageCount,
      pastFailures,
      profile.efficiency_rank,
      profile.efficiency_points,
      profile.active_focus,
      memory || {}, 
      knowledgeBase, 
      profile.custom_instructions
    );

    const finalSystemPrompt = customSystemPrompt || fullSystemPrompt;
    const userContent = await processAttachments(message, attachments);

     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openAIHistory = previousHistory.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const fullMessages = [
        { role: "system", content: finalSystemPrompt },
        ...openAIHistory,
        { role: "user", content: userContent },
    ];

    // 3. Add to Queue with PRE-BUILT MESSAGES
    const job = await chatQueue.add("chat", {
       userId,
       message,
       conversationId: currentConversationId, 
       messages: fullMessages, // CRITICAL: Pass the brain context
       mode,
       topic,
       isMobile,
       attachments,
    });

    // 4. Respond Async
    res.status(202).json({
      jobId: job.id,
      conversationId: currentConversationId,
      status: "queued"
    });
  })
);

// --- PROYECTOS (Simplificados) ---
// --- PROYECTOS (Simplificados) ---
// --- REPLACED: ASYNC JOB STATUS ENDPOINT ---
router.get(
  "/chat/job/:jobId",
  authenticate,
  asyncHandler(async (req, res) => {
    const job = await chatQueue.getJob(req.params.jobId);

    if (!job) {
      return res.status(404).json({ status: "not_found" });
    }

    const state = await job.getState();
    const result = job.returnvalue;

    return res.json({
      jobId: job.id,
      status: state,
      result: state === "completed" ? result : null,
      error: state === "failed" ? job.failedReason : null,
      progress: job.progress
    });
  })
);

// --- PROYECTOS (Simplificados) ---
router.get(
  "/projects",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    res.json(data);
  })
);

router.post(
  "/projects",
  authenticate,
  validateProjectInput,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { data } = await supabase
      .from("projects")
      .insert([{ ...req.body, user_id: user.id }])
      .select()
      .single();
    res.json(data);
  })
);

// Helper: Generate Technical Project Name
const generateProjectName = async (description: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
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
  authenticate,
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
          user_id: user.id,
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

router.delete(
  "/projects/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = req.user;
    await supabase
      .from("projects")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", user.id);
    res.json({ success: true });
  })
);

// Conversations list
router.get(
  "/conversations",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    res.json(data);
  })
);

router.delete(
  "/conversations/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = req.user;
    await supabase
      .from("conversations")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", user.id);
    res.json({ success: true });
  })
);

// 1.6 Get Single Conversation (with messages)
router.get(
  "/conversations/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { id } = req.params;

    // Obtener metadatos de la conversación
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
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

// ------------------------------------------------------------------
// DOCUMENT INTAKE (Intake & RAG Phase 1)
// ------------------------------------------------------------------
router.post(
  "/documents/upload",
  authenticate,
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

    res.json({
      filename: req.file.originalname,
      content: textContent,
      size: req.file.size,
      tokens: Math.round(estimatedTokens),
      message: "Archivo procesado. Si esperabas un premio, seguí esperando.",
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
  authenticate,
  asyncHandler(async (req, res) => {
    const user = req.user;

    // 1. Get recent unsynthesized messages
    // (For this V4, we just take the last 20 messages of the user to find patterns)
    const { data: recentMsgs } = await supabase
      .from("messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!recentMsgs || recentMsgs.length < 5) {
      return res.json({ message: "Not enough data to reflect." });
    }

    const conversationText = recentMsgs
      .reverse()
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    // 2. Ask AI to distill knowledge
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
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
        user_id: user.id,
        knowledge_point: insight.point,
        category: insight.category,
      });

      // Add to Inner Sanctum Report
      const { data: reflect } = await supabase
        .from("wadi_reflections")
        .insert({
          user_id: user.id,
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
  authenticate,
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
  authenticate,
  requireScope("admin:*"),
  asyncHandler(async (req, res) => {
    const user = req.user;

    // 1. Fetch current reflections
    const { data: reflections } = await supabase
      .from("wadi_reflections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!reflections || reflections.length === 0) {
      return res.json({ message: "Nada que archivar." });
    }

    // 2. Format as Markdown
    const dateStr = new Date().toISOString().split("T")[0];
    let fileContent = `# WADI EVOLUTION LOG [${dateStr}]\n\n`;

    reflections.forEach((r) => {
      fileContent += `## [${r.type}] ${new Date(r.created_at).toLocaleTimeString()}\n`;
      fileContent += `Priority: ${r.priority}\n`;
      fileContent += `${r.content}\n\n---\n\n`;
    });

    // 3. Save to Cloud Reports
    const fileName = `${dateStr}_evolution_log_${Date.now()}.txt`;
    await supabase.from("wadi_cloud_reports").insert({
      user_id: user.id,
      name: fileName,
      content: fileContent,
      type: "EVOLUTION_LOG",
    });

    // 4. Clear Reflections (Limpiar Mesa)
    await supabase.from("wadi_reflections").delete().eq("user_id", user.id);

    res.json({ success: true, archivedFile: fileName });
  })
);

// --- JOURNAL (CLOUD LOGS) ---
router.get(
  "/journal/files",
  authenticate,
  requireScope("admin:*"),
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { data } = await supabase
      .from("wadi_cloud_reports")
      .select("*")
      .eq("user_id", user.id)
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
    const prompt = generateSystemPrompt(
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
