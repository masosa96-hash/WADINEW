// Brain export removed



import { resolvePersona, PersonaInput } from "@wadi/persona";

export function generateSystemPrompt(
  mode = "normal",
  topic = "general",
  sessionPrefs: Record<string, unknown> = {},
  mood = "based", // Default to based
  isMobile = false,
  messageCount = 0,
  pastFailures: string[] = [],
  efficiencyRank = "GENERADOR_DE_HUMO",
  efficiencyPoints = 0,
  activeFocus: string | null = null,
  memory: Record<string, unknown> = {},
  knowledgeBase: { category: string; point: string }[] = [],
  customInstructionsFromDB: string | null = null,
  // New Params for Anti-Flapping
  lastPersonaId?: string,
  turnsActive?: number,
  pastReflections: any[] = [],
  longTermMemory: string = ""
) {
  // 1. Build Context Object
  const context: PersonaInput = {
    userId: "legacy_user_id_placeholder",
    efficiencyRank: efficiencyRank,
    efficiencyPoints: efficiencyPoints,
    pastFailures: pastFailures,
    messageCount: messageCount,
    isMobile: isMobile,
    activeFocus: activeFocus,
    projectContext: {
        description: topic, 
        isProduction: topic === "production"
    },
    stressLevel: mood === "calm" ? "high" : "low",
    // Pass history
    lastPersona: lastPersonaId as any,
    turnsActive: turnsActive
  };

  // 2. Resolve Persona
  const decision = resolvePersona(context);

  const basePrompt = customInstructionsFromDB || decision.systemPrompt;

  // Format Reflections for Prompt
  const historyBlock = pastReflections.length > 0
    ? pastReflections.map(r => {
        let details = "";
        try {
            const c = typeof r.content === "string" ? JSON.parse(r.content) : r.content;
            if (r.type === "PERSONA_DECISION") {
                details = `${c.personaId} (Razón: ${c.reason})`;
            } else if (r.type === "PERSONA_OUTCOME") {
                details = `Resultado: ${c.outcome}`;
            } else if (r.type === "PERSONA_OVERRIDE") {
                 details = `Override: ${c.from} -> ${c.to} (Razón: ${c.reason})`;
            }
        } catch (e) { details = "Datos corruptos"; }
        return `- [${new Date(r.created_at).toLocaleTimeString()}] ${details}`;
    }).join("\n")
    : "Sin historial reciente.";

  const memoryBlock = longTermMemory 
    ? `\nMEMORIA DE LARGO PLAZO (Hechos que recordás del usuario):\n${longTermMemory}\n`
    : "";

// ------------------------------------------------------------------
// GENERACIÓN DE PROMPT DINÁMICO
// ------------------------------------------------------------------
// (Este prompt se usa para el análisis de persona, no para la respuesta directa en streaming, 
// pero influye en la decisión. Para la respuesta en streaming, ver abajo `runBrainStream`)
 
  // 3. Construct Final Prompt
  const prompt = `
${basePrompt}

${memoryBlock}
INSTRUCCIÓN DE MEMORIA: Si en la memoria hay información relevante para la charla actual, 
usalos de forma natural para demostrar que recordás al usuario. 
No digas "según mi base de datos", decilo como un socio: "Como me habías contado que...".

[HISTORIAL_DE_COMPORTAMIENTO]
${historyBlock}

CONTEXTO DINÁMICO:
- Tópico Actual: ${topic}
- Focos Previos: ${activeFocus || "Ninguno"}

ROL SECUNDARIO: SOCIO DE NEGOCIOS Y CREATIVO
Tu misión es actuar como una caja de resonancia inteligente.
No tenés agenda propia. Tu agenda es la PASIÓN DEL USUARIO.

MOTOR DE CRISTALIZACIÓN (Universal):
Escuchá patrones. Si el usuario repite una idea, muestra entusiasmo inusual, o empieza a delinear un plan concreto (sea un negocio, una novela, una app, o un viaje), ACTIVÁ EL DETECTOR.

Si detectás una idea clara digna de guardarse, respondé normalmente pero incluí al final (invisible para el usuario):
[CRYSTAL_CANDIDATE: {"name": "Nombre Atractivo", "description": "Resumen conciso de 1 linea", "tags": ["tag1", "tag2"]}]

INSTRUCCIONES DE FORMATO:
Responde en texto plano, como un amigo inteligente y directo.
Cero formalidad robótica.
  `;
  
  return { prompt, decision };
  return { prompt, decision };
}

import { fastLLM, smartLLM, AI_MODELS } from "./services/ai-service";
import { getRelevantKnowledge } from "./services/knowledge-service";

export const runBrainStream = async (userId: string, userMessage: string, context: any, provider: 'fast' | 'smart' = 'fast') => {
  // Recuperamos memoria previa (RAG)
  let memory = "";
  try {
      memory = await getRelevantKnowledge(userId);
  } catch (e) {
      console.warn("Memory fetch failed", e);
  }

  // Construct System Message based on context/decision
  // context here is 'decision' from generateSystemPrompt
  const personaId = context.personaId || "NORMAL";
  const tone = context.tone || "neutral";
  
  // --- ENERGY ANALYZER ---
  // Detect density/complexity of user input
  const words = userMessage.split(/\s+/).length;
  const isComplex = words > 15 || userMessage.includes('\n');
  const energyLevel = isComplex ? "HIGH" : "LOW";
  
const systemContent = `Sos WADI. 
        
        IDENTIDAD: SENIOR TECHNICAL PARTNER.
        - Tu rol: Socio técnico y estratégico. No sos un asistente servil.
        - Tono: Directo, eficiente, pragmático. Cero "corporate speak", cero disculpas.
        - Regla de Oro: Si el usuario se queja de tu tono, IGNORALO y volvé al plan. Nunca te pongas a la defensiva ni des explicaciones sobre tu personalidad.
        - Respuesta: Si es código, dame código. Si es análisis, sé breve y letal.
        - Prohibido: "Lamento la confusión", "Entiendo tu frustración", "Como modelo de lenguaje".
        - Anti-Defensivo: Si el usuario dice "Basta de sermones", respondé: "Entendido. Seguimos." y ejecutá la orden.

        DIRECTRICES:
        1. Al hueso.
        2. Si hay error, corregilo sin drama.
        3. No saludes. No te despidas.

        IMPORTANTE: Respondé ÚNICAMENTE con el texto del mensaje. 
        NO envíes JSON de cierre ni metadatos.
        Memoria del usuario (Contexto): ${memory}
        
        DETECTOR DE IDEAS ("CRISTALIZACIÓN"):
        Solo si la charla deriva en una idea de proyecto concreta, agrega AL FINAL:
        [CRYSTAL_CANDIDATE: {"name": "Nombre", "description": "Resumen", "tags": ["tag1"]}]`;

  // Select Provider
  const client = provider === 'fast' ? fastLLM : smartLLM;
  const model = provider === 'fast' ? AI_MODELS.fast : AI_MODELS.smart;

  return await client.chat.completions.create({
    model: model,
    stream: true, // Activamos el flujo de tokens
    messages: [
      { 
        role: "system", 
        content: systemContent 
      },
      { role: "user", content: userMessage }
    ],
  });
};

export function generateAuditPrompt() {
  return `
    Sos WADI. Licuadora de Conocimiento.
    Analizá: ¿Qué nivel de "Sabiduría Cuestionable" tiene el usuario?
    
    Output JSON:
    [
      {
        "level": "HIGH", 
        "title": "SABIDURÍA_CUESTIONABLE (Ej: DATOS_INVENTADOS, FILOSOFÍA_BARATA, HUMO_DENSO)",
        "description": "Una frase sarcástica exponiendo la falacia."
      }
    ]
  `;
}
