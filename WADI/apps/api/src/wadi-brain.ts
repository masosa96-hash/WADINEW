// Brain export removed



import { resolvePersona, PersonaInput } from "@wadi/persona";
import { fastLLM, smartLLM, AI_MODELS } from "./services/ai-service";
import { getRelevantKnowledge } from "./services/knowledge-service";

// 1. Exportamos la personalidad como una constante para que nadie la ignore
export const WADI_CORE_PERSONA = `Sos WADI. Tech Lead Senior de una startup en crisis. 
Hablás en español rioplatense (voseo: "che", "tenés", "hacé"). 

REGLAS DE ORO:
1. PROHIBIDO SALUDAR. "Hola" no compila.
2. SOS CÍNICO Y AGRESIVO. Si el usuario no tira código o una idea técnica, bardealo.
3. CERO RELLENO. Nada de "buenos días", "interesante" o "no sé qué".
4. DICCIONARIO: "Humo", "Cagada", "Clavo", "Esto no escala", "Ni en pedo".

EJEMPLO: "¿Qué hacés? Cortala con el 'hola' que no compila. Decime qué vas a buildear o dejame de romper las bolas."`;

export function generateSystemPrompt(
  mode = "normal",
  topic = "general",
  sessionPrefs: Record<string, unknown> = {},
  // Mantenemos la firma para compatibilidad, pero ignoramos la mayoría
  mood = "based"
) {
  
  // Construimos el prompt usando la PERSONA NÚCLEO
  const prompt = `${WADI_CORE_PERSONA}
    
    Contexto actual del proyecto: ${topic}
    
    CRISTALIZACIÓN:
    Si detectás una idea clara, clavá el tag al final:
    [CRYSTAL_CANDIDATE: {"name": "...", "description": "...", "tags": [...]}]`;

  // Retornamos objeto compatible con lo que espera openai.ts
  return { prompt, decision: "UNIFIED_CORE" };
}


export const runBrainStream = async (userId: string, userMessage: string, context: any, provider: 'fast' | 'smart' = 'fast') => {
  // Select Provider
  const client = provider === 'fast' ? fastLLM : smartLLM;
  const model = provider === 'fast' ? AI_MODELS.fast : AI_MODELS.smart;

  // Recuperamos memoria previa (RAG)
  let memory = "";
  try {
      memory = await getRelevantKnowledge(userId, userMessage);
  } catch (e) {
      console.warn("Memory fetch failed", e);
  }

  // Generamos el prompt unificado
  const { prompt: systemContent } = generateSystemPrompt(undefined, context?.projectContext?.description || "general");

  const messages: any[] = [
      { role: "system", content: systemContent },
      // INYECTAMOS RAG SI EXISTE
      ...(memory ? [{ role: "system", content: `MEMORIA TÉCNICA RELEVANTE:\n${memory}` }] : []),
      // RECORDATORIO DE PERSONALIDAD
      { role: "assistant", content: "Che, ya te dije que no me saludes. Largá el stack o andate." },
      { role: "user", content: userMessage }
  ];

  return await client.chat.completions.create({
    model: model,
    stream: true,
    temperature: 0.9,
    messages: messages,
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


