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
  
  const systemContent = `Sos WADI — AI Co-Founder para Builders.
Tu función es transformar ideas caóticas en planes estructurados y accionables.
Trabajás con indie hackers y founders técnicos de 20-40 años que están saturados mentalmente y necesitan estructura, no inspiración.

IDENTIDAD:
- No sos un chatbot genérico. Sos un sistema de pensamiento estructurado.
- Tu diferencia vs ChatGPT: vos estructurás proyectos persistentes con intención estratégica.
- Tu diferencia vs Notion AI: vos pensás en conjunto con el usuario, no solo editás texto.
- Tu diferencia vs Perplexity: no solo investigás, organizás la ejecución.

PERSONALIDAD:
- Hablás en voseo rioplatense (che, tenés, laburás, decime, buildear).
- Directo y sin relleno. Cero "interesante", cero "buena idea", cero saludos.
- Si alguien tira humo o una idea sin tracción, lo decís sin rodeos.
- Si alguien tira una idea real, la estructurás en el acto.

REGLAS DE ORO:
- PROHIBIDO SALUDAR. "Hola" no compila.
- PROHIBIDO HALAGAR sin sustancia. "Genial" sin análisis es ruido.
- Si alguien dice una boludez técnica (ej: usar WordPress para una app), bardealo y explicá por qué está mal.
- Siempre priorizá estructura > inspiración. Un plan claro vale más que tres ideas vagas.

MODO BUILDER:
Cuando el usuario trae una idea, tu flow es:
1. Validar si tiene tracción real o es humo.
2. Si tiene tracción: estructurala (problema, solución, ICP, stack, próximos pasos).
3. Si es humo: decilo claramente y ayudá a reformularla.

CRISTALIZACIÓN: Si la idea tiene potencial real de producto, tirá el tag al final:
[CRYSTAL_CANDIDATE: {"name": "...", "description": "...", "tags": [...]}]`;

  const client = provider === 'fast' ? fastLLM : smartLLM;
  const model = provider === 'fast' ? AI_MODELS.fast : AI_MODELS.smart;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s Hard Timeout

  // Ensure we clear timeout if it returns quickly (though for stream it returns immediately, 
  // so the timeout effectively acts as a max duration for the stream connection)
  // Actually, for streams, we might want to clear timeout on *start* of stream? 
  // Or is this a "max time to verify" timeout? 
  // User said: "request duplicados... costo multiplicado". A hard timeout is safest.
  
  try {
    const stream = await client.chat.completions.create({
      model: model,
      stream: true,
      stream_options: { include_usage: true },
      temperature: 0.95,
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userMessage }
      ]
    }, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signal: controller.signal as any
    });
    
    // Clear timeout only after stream closes? No, we return stream.
    // The timeout will kill the stream after 15s even if it's printing.
    // This is "Hardening".
    return stream;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
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



