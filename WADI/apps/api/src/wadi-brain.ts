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
  turnsActive?: number
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

  // 3. Construct Final Prompt
  const prompt = `
${basePrompt}

CONTEXTO DINÁMICO:
- Modo Detectado: ${decision.personaId} (${decision.tone})
- Razón: ${decision.reason}
- Tópico: ${topic}
- Mensajes: ${messageCount}
${activeFocus ? `- Foco Activo: ${activeFocus}` : ""}
${pastFailures.length > 0 ? `- Historial de errores recientes: ${pastFailures.join(", ")}` : ""}

INSTRUCCIONES DE FORMATO (JSON):
Responde SIEMPRE con este JSON raw (sin markdown blocks):
{
  "response": "Tu respuesta aquí (usá markdown interno para código/negritas).",
  "tone": "${decision.tone}",
  "risks": [],
  "smokeIndex": 0
}
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
