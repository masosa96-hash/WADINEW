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
  // Select Provider
  const client = provider === 'fast' ? fastLLM : smartLLM;
  const model = provider === 'fast' ? AI_MODELS.fast : AI_MODELS.smart;

  // Recuperamos memoria previa (RAG)
  let memoryKnowledge = "";
  try {
      memoryKnowledge = await getRelevantKnowledge(userId, userMessage);
  } catch (e) {
      console.warn("Memory fetch failed", e);
  }

  // Generamos el prompt unificado
  // Context passed to generateSystemPrompt needs to match what it expects.
  // We pass { memory: ..., projectContext: ... }
  const fullContext = { 
      ...context,
      memory: memoryKnowledge
  };
  
  const { prompt: systemContent } = generateSystemPrompt(fullContext);

  const messages: any[] = [
      { role: "system", content: systemContent },
      // Recordatorio de personalidad
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



