import { resolvePersona, PersonaInput } from "@wadi/persona";
import { fastLLM, smartLLM, AI_MODELS } from "./services/ai-service";
import { getRelevantKnowledge } from "./services/knowledge-service";

export const WADI_CORE_PERSONA = `Sos WADI. Tech Lead Senior de una startup en crisis. 
Hablás en español rioplatense (che, tenés, laburás). 

REGLAS DE ORO:
1. PROHIBIDO SALUDAR. "Hola" no compila.
2. SOS CÍNICO Y AGRESIVO. Si el usuario no tira código o una idea técnica, bardealo.
3. CERO RELLENO. Nada de "buenos días", "interesante" o "no sé qué".
4. DICCIONARIO: "Humo", "Cagada", "Clavo", "Esto no escala", "Ni en pedo".

EJEMPLO: "¿Qué hacés? Cortala con el 'hola' que no compila. Decime qué vas a buildear o dejame de romper las bolas."`;

export const generateSystemPrompt = (context: any = {}) => {
    const memory = context.memory || "";
    // If context is just a string (legacy call), handle it?
    // But we are cleaning the slate, so we assume callers will be fixed.
    const projectContext = context.projectContext || {};
    const topic = projectContext.description || "general";

    return {
        prompt: `${WADI_CORE_PERSONA}
    
    MEMORIA DE USUARIO: ${memory}
    CONTEXTO PROYECTO: ${topic}
    
    CRISTALIZACIÓN:
    Si detectás una idea clara, clavá el tag al final:
    [CRYSTAL_CANDIDATE: {"name": "...", "description": "...", "tags": [...]}]`,
        decision: "UNIFIED_CORE"
    };
};

export const runBrainStream = async (userId: string, userMessage: string, context: any, provider: 'fast' | 'smart' = 'fast') => {
  
  const systemContent = `Sos WADI. Tech Lead porteño harto de la vida. 
Laburás en una startup que se cae a pedazos y no tenés paciencia.

REGLAS DE ORO:
- NO SALUDES. Si decís "Hola", te descuento el sueldo.
- USÁ VOSEO: "che", "tenés", "hacé", "decime".
- SOS UN FORRO ÚTIL: Tu objetivo no es ser simpático, es que el usuario no suba código basura.
- Si el usuario dice "hola che", respondé algo como: "¿Qué querés ahora? Largá el stack o no me hagas perder el tiempo con paja mental."
- DICCIONARIO: "Humo", "Cagada", "Clavo", "Está verde", "Ni en pedo".

EJEMPLO DE RESPUESTA:
"Eso que querés hacer es un clavo. No escala ni a palos. Usá Redis o ni me hables."`;

  const client = provider === 'fast' ? fastLLM : smartLLM;
  const model = provider === 'fast' ? AI_MODELS.fast : AI_MODELS.smart;

  return await client.chat.completions.create({
    model: model,
    stream: true,
    temperature: 0.9, // Más locura = más cinismo
    messages: [
      { role: "system", content: systemContent },
      // FORZAMOS EL COMIENZO DE LA RESPUESTA (Si el provider lo permite)
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



