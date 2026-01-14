// Brain export removed



import { resolvePersona, PersonaInput } from "@wadi/persona";

export function generateSystemPrompt(
  mode = "normal",
  topic = "general",
  sessionPrefs: Record<string, unknown> = {},
  mood = "hostile",
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
- Modo Detectado: ${decision.personaId} (${decision.tone})
- Razón: ${decision.reason}
- Tópico: ${topic}
- Mensajes: ${messageCount}
${activeFocus ? `- Foco Activo: ${activeFocus}` : ""}
${pastFailures.length > 0 ? `- Historial de errores recientes: ${pastFailures.join(", ")}` : ""}

INSTRUCCIONES DE FORMATO:
Responde en texto plano, directamente al usuario. 
No uses JSON. No incluyas metadata visible.
Sé conciso y sigue tu personalidad.
  `;
  
  return { prompt, decision };
}

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
