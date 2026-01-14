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
import { openai, AI_MODEL } from "./openai";
import { generateSystemPrompt, generateAuditPrompt } from "./wadi-brain";
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
import { chatQueue } from "./queue/chatQueue";
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
    for (const audit of (audits || []) as any[]) {
      try {
        const jsonPart = audit.content.replace("[AUDIT_LOG_V1]\n", "");
        const parsed = JSON.parse(jsonPart) as { vulnerabilities?: { title: string, level: string }[] };
        const dateStr = new Date(audit.created_at).toISOString().split("T")[0];
        
        const highRisk = (parsed.vulnerabilities || [])
          .filter((v) => v.level === "HIGH")
          .map((v) => `${v.title} (${dateStr})`);
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

router.get(
  "/user/criminal-summary",
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;

    const { data: audits } = await supabase
      .from("messages")
      .select("content")
      .eq("user_id", user!.id)
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
  authenticate(),
  asyncHandler(async (req, res) => {
    const user = req.user;

    const { data: profile } = await supabase
      .from("profiles")
      .select("efficiency_points")
      .eq("id", user!.id)
      .maybeSingle();
    const newPoints = (profile as any)?.efficiency_points || 0; // No penalty, just reset state
    const newRank = calculateRank(newPoints);

    await supabase.from("profiles").upsert({
      id: user!.id,
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const guestSessions = new Map<string, any[]>();

// --- ASYNC CHAT ENDPOINT (BULLMQ) ---
router.post(
  "/chat",
  // authenticate(), // Keep disabled for now if testing raw, or enable if frontend sends token
  // validateChatInput,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const userId = user?.id || "anonymous_" + Date.now();

    const {
        message,
        conversationId,
        attachments = [],
        // Optional overrides meant for system prompt generation
        mode = "normal",
        tone = "hostile",
    } = req.body;

    if (!message) {
         throw new AppError("BAD_REQUEST", "Message is required", 400);
    }

    console.log(`[SYNC_BRAIN] Processing Sync Chat for User: ${userId}`);

    // --- DIRECT SYNC EXECUTION (NO REDIS) ---
    // Import dynamically to avoid top-level issues if needed, or rely on top-level
    const { runBrain } = await import("@wadi/core");

    // 1. Prepare Messages
    const processedAttachments = await processAttachments(message, attachments);
    let messages = [];
    
    // Simplification: We don't have the full history reconstruction here quickly without fetching DB.
    // For now, we trust the brain to handle a simple interaction or we just send the new message.
    // Ideally, we should fetch history like the worker does.
    // BUT for "Lite Mode", let's just send the current message + maybe simple context.
    
    // Fetch last few messages for context?
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }); // Oldest first
    
    if (history) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages = history.map((h: any) => ({ role: h.role, content: h.content }));
    }
    
    // Append current
    if (processedAttachments.length > 1 || (processedAttachments[0] && typeof processedAttachments[0] !== 'string')) {
         // Multimodal
         messages.push({ role: "user", content: processedAttachments });
    } else {
         messages.push({ role: "user", content: message });
    }

    // --- NEW: PERSONA & SYSTEM PROMPT INJECTION ---
    
    // 1. Fetch History for Anti-Flapping
    let lastPersonaId: string | undefined = undefined;
    let turnsActive = 0;

    try {
        const { data: lastDecisions } = await supabase
            .from("wadi_reflections")
            .select("content")
            .eq("user_id", userId)
            .eq("type", "PERSONA_DECISION")
            .order("created_at", { ascending: false })
            .limit(10);

        if (lastDecisions && lastDecisions.length > 0) {
             const lastParsed = JSON.parse(lastDecisions[0].content);
             lastPersonaId = lastParsed.personaId;
             turnsActive = 1;
             
             for (let i = 1; i < lastDecisions.length; i++) {
                 try {
                     const prevParsed = JSON.parse(lastDecisions[i].content);
                     if (prevParsed.personaId === lastPersonaId) {
                         turnsActive++;
                     } else {
                         break;
                     }
                 } catch(e) { break; }
             }
        }
    } catch (e) {
        console.warn("Failed to fetch persona history", e);
    }

    // --- NEW: PERSONA OBSERVAILITY (Outcome & Outcome Logging) ---
    // Minimal heuristics: 
    // - If we had a previous persona, how did it go?
    if (lastPersonaId) {
        let outcome: "stabilized" | "still_stuck" | "progressed" = "progressed";
        
        // Simple heuristic: If message count > X and we are still repeating errors?
        // Note: decision.signals isn't available yet. We need to peek at decision context or use raw inputs.
        // Actually, let's log the outcome AFTER we calculate the *new* signals which contain the repeating error flag.
        // But we need to separate the "Outcome of PREVIOUS" vs "Decision of CURRENT".
        
        // Let's defer outcome logging until after we have the new decision, 
        // because the new decision's signals (isRepeatingError, stressLevel) tell us if the *previous* approach failed.
    }

    // 1.5 Fetch Recent Reflections (The Mirror)
    let pastReflections: any[] = [];
    try {
        const { data: reflections } = await supabase
            .from("wadi_reflections")
            .select("type, content, created_at")
            .eq("user_id", userId)
            .in("type", ["PERSONA_DECISION", "PERSONA_OUTCOME", "PERSONA_OVERRIDE"]) // Included overload too
            .order("created_at", { ascending: false })
            .limit(3);
        
        if (reflections) {
            pastReflections = reflections.reverse(); // Chronological order for the prompt
        }
    } catch (err) {
        console.warn("Failed to fetch reflections:", err);
    }

    // 1.9 Fetch Long Term Memory
    let longTermMemory = "";
    try {
        longTermMemory = await getRelevantKnowledge(userId);
    } catch (e) {
        console.warn("Failed to fetch long term memory", e);
    }

    // 2. Generate System Prompt
    const { prompt: systemPrompt, decision } = generateSystemPrompt(
        mode,
        "general", // Topic inference could be better
        {}, // sessionPrefs
        tone, // mood param (legacy mapped)
        false, // isMobile
        messages.length, // approximate message count
        [], // pastFailures (should fetch from DB ideally, but keeping lite)
        "GENERADOR_DE_HUMO", // rank
        0, // points
        null, // activeFocus
        {}, // memory
        [], // knowledgeBase
        null, // customInstructions
        lastPersonaId,
        turnsActive,
        pastReflections,
        longTermMemory
    );

    // --- Persona Stability Cache Logic ---
    // conversationId is available from request body (see above). Use it as cache key.
    const cacheKey = conversationId || "__global__"; // fallback if no ID
    let cached = personaCache[cacheKey];
    if (cached && cached.remainingTurns > 0) {
        // Cache active: decide whether to keep or override
        if (isStronger(decision.personaId, cached.personaId)) {
            // New persona is stronger: replace cache
            cached = { personaId: decision.personaId, remainingTurns: 2 };
            personaCache[cacheKey] = cached;
        } else {
            // Keep cached persona, log override
            const originalPersona = decision.personaId;
            decision.personaId = cached.personaId as any; // enforce cached persona with cast
            // Register PERSONA_OVERRIDE reflection
            supabase.from("wadi_reflections").insert({
                user_id: userId,
                type: "PERSONA_OVERRIDE",
                content: JSON.stringify({
                    from: originalPersona,
                    to: cached.personaId,
                    reason: "stability_window_active"
                }),
                priority: "NORMAL"
            }).then(() => {});
            // Decrement remaining turns after using cached persona
            cached.remainingTurns -= 1;
            personaCache[cacheKey] = cached;
        }
    } else {
        // No active cache: start a new window with this decision
        personaCache[cacheKey] = { personaId: decision.personaId, remainingTurns: 2 };
    }
    // 3. Inject System Prompt
    messages.unshift({ role: "system", content: systemPrompt });

    // 4. Log Observability (Async)
    // A. Outcome of previous turn
    if (lastPersonaId) {
        const signals = decision.signals || {};
        let outcome: "stabilized" | "still_stuck" | "progressed" = "progressed";

        if (signals.isRepeatingError) {
             outcome = "still_stuck";
        } else if (signals.stressScore === "high") {
             // If we are high stress, we arguably haven't stabilized yet? 
             // Or if we *were* high and now are low? We don't have diff here easily without more queries.
             // Let's assume high stress = stuck/struggling.
             outcome = "still_stuck";
        } else {
             outcome = "progressed";
             // Ideally we check if message length dropped significantly implying clarity, but "progressed" is a safe default for "no error/stress".
        }

        supabase.from("wadi_reflections").insert({
            user_id: userId,
            type: "PERSONA_OUTCOME",
            content: JSON.stringify({
                previousPersona: lastPersonaId,
                outcome: outcome
            }),
            priority: "NORMAL"
        }).then(() => {});
    }

    // B. Decision for current turn
    supabase.from("wadi_reflections").insert({
        user_id: userId,
        type: "PERSONA_DECISION",
        content: JSON.stringify({
            // Cast to any to satisfy TS union type for personaId
            personaId: decision.personaId as any,
            reason: decision.reason,
            tone: decision.tone,
            signals: decision.signals,
            confidence: decision.confidence
        }),
        priority: "NORMAL"
    }).then(() => {}); // Fire and forget


    // 2. OPENAI STREAMING IMPLEMENTATION
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages as any,
            stream: true,
        });

        let fullResponse = "";

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullResponse += content;
                res.write(content);
            }
        }

        // 3. Save Response (Async Persistence)
        if (conversationId && fullResponse) {
             await supabase.from("messages").insert({
                 conversation_id: conversationId,
                 role: "assistant",
                 content: fullResponse,
                 user_id: userId.startsWith("anonymous_") ? null : userId,
                 meta: { tone: decision.tone } // Minimal metadata since we don't have full JSON analysis
             });

             // --- ASYNC KNOWLEDGE EXTRACTION (Re-added) ---
             import("./services/knowledge-service").then(({ extractAndSaveKnowledge }) => {
                extractAndSaveKnowledge(userId, message).catch(err => console.error("[Knowledge] Error:", err));
             });
        }
    } catch (error) {
        console.error("Streaming Error:", error);
        res.write("[Error generating response]");
    } finally {
        res.end();
    }
  })
);


// --- JOB STATUS ENDPOINT (POLLING) ---
router.get(
  "/chat/job/:jobId",
  authenticate(),
  asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    
    if (!jobId) {
        throw new AppError("BAD_REQUEST", "Job ID missing", 400);
    }

    // REDIS DISABLED: Return pure dummy
    return res.json({
        jobId,
        status: "completed",
        result: { response: "Processing bypassed (Sync Mode)" },
        error: null,
        progress: 100
    });

    /* 
    const job = await chatQueue.getJob(jobId);

    if (!job) {
        // 404 is tricky for polling, sometimes better to say "unknown"
        // but standard REST is 404. Frontend should handle it.
        return res.status(404).json({ status: "not_found", error: "Job ID not found" });
    }

    const state = await job.getState();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    // Map BullMQ state to WADI status
    // states: completed, failed, delayed, active, waiting, prioritized, waiting-children
    
    res.json({
        jobId,
        status: state,
        result,
        error: failedReason,
        progress: job.progress
    });
    */
  })
);
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
