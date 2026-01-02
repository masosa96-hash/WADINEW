import { Router } from "express";
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
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import { wadiPreFlight } from "./layers/human_pattern/index.js";
import { authenticate, authorize } from "./middleware/auth.js";

const router = Router();

// Helper: Authenticated User extraction is now handled by middleware (req.user)

// Helper: Async Wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper: Process attachments for OpenAI
const processAttachments = async (message, attachments) => {
  if (!attachments || attachments.length === 0) return message;

  // Si hay adjuntos, preparamos el contenido estructurado
  const content = [{ type: "text", text: message }];

  attachments.forEach((att) => {
    const url = typeof att === "string" ? att : att.url;
    if (url && (url.startsWith("data:image") || url.includes("supabase"))) {
      content.push({ type: "image_url", image_url: { url } });
    }
  });

  return content;
};

// Helper: Fetch Past Failures (Long Term Memory)
const fetchUserCriminalRecord = async (userId) => {
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
    let failures = [];

    for (const audit of audits) {
      try {
        const jsonPart = audit.content.replace("[AUDIT_LOG_V1]\n", "");
        const parsed = JSON.parse(jsonPart);
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

const calculateRank = (points) => {
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
      .eq("user_id", user.id)
      .eq("role", "system")
      .ilike("content", "[AUDIT_LOG_V1]%");

    let totalHighRisks = 0;
    if (audits) {
      audits.forEach((audit) => {
        try {
          const parsed = JSON.parse(
            audit.content.replace("[AUDIT_LOG_V1]\n", "")
          );
          totalHighRisks += (parsed.vulnerabilities || []).filter(
            (v) => v.level === "HIGH"
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
const guestSessions = new Map();

router.post(
  "/chat",
  authenticate(),
  validateChatInput,
  asyncHandler(async (req, res) => {
    let user = req.user;

    // Guest Mode: If no user, user stays null, but we proceed carefully.
    const {
      message,
      conversationId,
      mode,
      explainLevel,
      topic,
      attachments,
      isMobile,
      customSystemPrompt,
    } = req.body;

    let currentConversationId = conversationId;
    let history = [];
    let profile = {
      efficiency_rank: "VISITANTE",
      efficiency_points: 0,
      active_focus: null,
    };
    let pastFailures = [];
    let knowledgeBase = [];

    // --- CASE A: AUTHENTICATED USER ---
    if (user) {
      if (!currentConversationId) {
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
        currentConversationId = newConv.id;
      }

      await supabase.from("messages").insert({
        conversation_id: currentConversationId,
        user_id: user.id,
        role: "user",
        content: message,
        attachments: attachments || [],
      });

      const { data: dbHistory } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", currentConversationId)
        .order("created_at", { ascending: true });
      history = dbHistory || [];

      // [SAFETY]: If DB read missed the insert (race condition), manually add current message
      if (history.length === 0) {
        history.push({ role: "user", content: message });
      }

      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (dbProfile) profile = dbProfile;

      pastFailures = await fetchUserCriminalRecord(user.id);
      knowledgeBase = await fetchKnowledgeBase(user.id);
    }
    // --- CASE B: GUEST MODE (IN-MEMORY) ---
    else {
      if (!currentConversationId) {
        currentConversationId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        guestSessions.set(currentConversationId, []);
      }

      if (!guestSessions.has(currentConversationId)) {
        guestSessions.set(currentConversationId, []);
      }
      history = guestSessions.get(currentConversationId);

      // Add User Message to Memory
      history.push({ role: "user", content: message });

      profile = {
        efficiency_rank: "VISITANTE_CURIOSO",
        efficiency_points: 0,
        active_focus: null,
      };
    }

    // --- HUMAN PATTERN LAYER (WADI V1) ---
    // WADI responde desde experiencia acumulada, no desde definiciones abstractas.
    // Si puede describir un patrón humano, no explica teoría.

    // --- HUMAN PATTERN LAYER (WADI V1) ---
    // SKIP IF PANIC MODE
    if (mode !== "panic") {
      const preFlightData = wadiPreFlight(message);

      if (preFlightData) {
        console.log(`[WADI HUMAN LAYER] Response sent. HALTING.`);
        return res.json({
          reply: preFlightData.reply,
          detectedPattern: preFlightData.pattern,
          conversationId: currentConversationId,
          efficiencyPoints: profile.efficiency_points,
        });
      }
    }

    // --- COMMON: GENERATE AI RESPONSE ---

    // [FIX]: Remove current msg from history for prompt context, and limit to recent history
    const previousHistory = history.slice(0, -1).slice(-20);
    const messageCount = history.length - 1; // Correct count of previous messages

    const fullSystemPrompt = generateSystemPrompt(
      mode || "normal",
      topic || "general",
      explainLevel || "normal",
      {}, // sessionPrefs
      "hostile",
      isMobile,
      messageCount,
      pastFailures,
      profile.efficiency_rank,
      profile.efficiency_points,
      profile.active_focus,
      req.body.memory || {}, // Pass memory
      knowledgeBase // Pass knowledge
    );

    // [DEBUG OVERRIDE]
    const finalSystemPrompt = customSystemPrompt || fullSystemPrompt;

    const userContent = await processAttachments(message, attachments);

    // Prepare OpenAI Messages: System + Previous History + Current User Message
    const openAIHistory = previousHistory.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      console.log(
        `[AI START] Calling model for conv ${currentConversationId}...`
      );

      // 3. TIMEOUT SAFETY (25s)
      const timeoutMs = 25000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const completion = await Promise.race([
        openai.chat.completions.create({
          model: AI_MODEL,
          messages: [
            { role: "system", content: finalSystemPrompt },
            ...openAIHistory,
            { role: "user", content: userContent },
          ],
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("AI_TIMEOUT")), timeoutMs)
        ),
      ]);
      clearTimeout(timeoutId);

      console.log(`[AI END] Response received.`);

      const reply = completion.choices[0].message.content;

      let newPoints = profile.efficiency_points;
      let newRank = profile.efficiency_rank;
      let systemDeath = false;

      // Persistence Update
      if (user) {
        let pointChange = 0;
        if (reply.includes("[FOCO_LIBERADO]")) {
          pointChange = 20;
        } else if (reply.includes("[FORCE_DECISION]")) {
          pointChange = -10;
        } else if (reply.includes("[DECONSTRUCT_START]")) {
          // Smoke Index: Penalty for excessive noise
          const noiseCount = (reply.match(/"category":\s*"RUIDO"/g) || [])
            .length;
          if (noiseCount > 3) pointChange = -10;
        }
        newPoints += pointChange;
        systemDeath = newPoints <= -50;

        if (systemDeath) {
          await supabase.from("messages").delete().eq("user_id", user.id);
          await supabase.from("conversations").delete().eq("user_id", user.id);
          newPoints = 0;
        }

        newRank = calculateRank(newPoints);

        await supabase.from("profiles").upsert({
          id: user.id,
          efficiency_points: newPoints,
          efficiency_rank: newRank,
          active_focus: reply.includes("[FOCO_LIBERADO]")
            ? null
            : profile.active_focus,
          updated_at: new Date().toISOString(),
        });

        if (!systemDeath) {
          await supabase.from("messages").insert({
            conversation_id: currentConversationId,
            user_id: user.id,
            role: "assistant",
            content: reply,
          });
        }
      } else {
        guestSessions
          .get(currentConversationId)
          .push({ role: "assistant", content: reply });
      }

      res.json({
        reply: systemDeath ? "SYSTEM FAILURE" : reply,
        conversationId: currentConversationId,
        efficiencyPoints: newPoints,
        efficiencyRank: newRank,
        systemDeath,
        isGuest: !user,
      });
    } catch (error) {
      console.error("[AI ERROR]:", error);
      let errorReply =
        "El sistema colapsó por su propia complejidad. O OpenAI está caído. Probá de nuevo.";
      if (error.message === "AI_TIMEOUT") {
        errorReply =
          "El modelo se quedó pensando demasiado. Tu pregunta debe ser fascinante o terriblemente aburrida. Simplificala.";
      }

      // Return a safe fallback instead of hanging
      res.json({
        reply: errorReply,
        conversationId: currentConversationId,
        efficiencyPoints: profile.efficiency_points,
      });
    }
  })
);

// --- PROYECTOS (Simplificados) ---
router.get(
  "/projects",
  authenticate(),
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
  authenticate(),
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
const generateProjectName = async (description) => {
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
    let name = completion.choices[0].message.content.trim();
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

    let { name, description } = req.body;

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
  authenticate(),
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
  authenticate(),
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
  authenticate(),
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
  authenticate(),
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
  authenticate(),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const user = req.user;

    if (!req.file) {
      throw new AppError("No enviaste ningún archivo. ¿Es una broma?", 400);
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
const fetchKnowledgeBase = async (userId) => {
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

    let insights = [];
    try {
      insights = JSON.parse(rawContent);
    } catch (e) {
      console.error("JSON Parse Error in Reflection", e);
      // Fallback: Try to save crude text if possible, or just fail gracefully.
      // For now, fail gracefully to avoid corrupt data.
      insights = [];
    }

    // 3. Store in Knowledge Base & Reflections
    const newReflections = [];

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
  authenticate(),
  authorize(["ADMIN"]), // Strict Admin check
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
  authorize(["ADMIN"]),
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
  authenticate(),
  authorize(["ADMIN"]),
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
      explainLevel || "normal",
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
