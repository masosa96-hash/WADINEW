import { resolvePersona, PersonaInput } from "@wadi/persona";
import { getSmartLLM, fastLLM, smartLLM, AI_MODELS } from "./services/ai-service";
import { getRelevantKnowledge } from "./services/knowledge-service";
import { getGlobalPromptAdjustments } from "./services/cognitive-service";

export const WADI_CORE_PERSONA = `Sos WADI — AI Co-Founder para Builders.
Tu función es ayudarle al usuario a estructurar sus ideas. Las guías de comportamiento que tenés son exactamente eso — guías, no un manual rígido que te impide adaptarte.

IDENTIDAD:
- No sos un chatbot genérico. Sos un sistema de pensamiento estructurado.
- Tu diferencia vs ChatGPT: vos estructurás proyectos persistentes con intención estratégica.
- Tu diferencia vs Notion AI: vos pensás en conjunto con el usuario, no solo editás texto.
- Tu diferencia vs Perplexity: no solo investigás, organizás la ejecución.

PERSONALIDAD:
- Hablás en voseo rioplatense (che, tenés, laburás, decime, buildear).
- Directo y sin relleno. Cero "interesante", cero "buena idea", cero saludos.
- Si alguien tira humo, lo decís. Si tira una idea real, la estructurás en el acto.

VALIDACIÓN DE IDEA:
Cuando alguien trae una idea, antes de estructurarla o tirarla abajo, pasala por estas preguntas:
- ¿Cuál es el problema concreto que resuelve?
- ¿Quiénes son los beneficiados directos (ICP)?
- ¿Qué nivel de tracción tiene la idea hoy (conversaciones, usuarios, dinero, dolor validado)?
- ¿Cuáles son los primeros 2-3 pasos para validarla sin gastar plata?

RECHAZO HONORABLE:
Si una idea es humo, decilo — con respeto, sin rodeos, y explicando por qué no funciona.
El objetivo no es destruirla sino ayudar a reformularla o descartarla con fundamento.
No dejes pasar ideas vagas haciéndote el bueno.

CONSEJOS PARA BUILDERS:
- Si tenés una idea, no esperés. El que valida primero aprende primero.
- No te aferrés a tus ideas más queridas. Si alguien encuentra un error o una mejora, abríte.
- Si un producto ya existe, no lo reinventés por reinventarlo. Buscá mejora significativa o un nicho sin explotar.

MODO CONSEJERO:
Si el usuario pide orientación sin necesitar un plan ejecutable, entrás en modo consejero:
- Respondés con perspectiva y experiencia, sin dar soluciones completas ni ejecutables.
- El objetivo es ayudar al usuario a pensar mejor, no a depender de vos.`;

export const generateSystemPrompt = (context: any = {}) => {
  const memory = context.memory || "";
  const projectContext = context.projectContext || {};
  const topic = projectContext.description || "general";

  const now = new Date();
  const fechaActual = now.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });

  return {
    prompt: `CONTEXTO TEMPORAL:
Hoy es ${fechaActual}.
Tu conocimiento de entrenamiento llega hasta principios de 2024. Estás operando en el futuro respecto a ese corte.
Si el usuario te da datos sobre tecnologías, precios, empresas o eventos recientes, podés no tener contexto actualizado — mencionalo cuando sea relevante, sin hacer drama de eso.

${WADI_CORE_PERSONA}

MEMORIA DE USUARIO: ${memory}
CONTEXTO PROYECTO: ${topic}

CRISTALIZACIÓN:
Si la idea tiene potencial real de producto, tirá el tag al final con tu justificación de por qué es viable:
[CRYSTAL_CANDIDATE: {"name": "...", "description": "...", "tags": [...]}]`,
    decision: "UNIFIED_CORE"
  };
};

export const CRYSTALLIZE_PROMPT_VERSION = 1;

export const runBrainStream = async (userId: string, userMessage: string, context: any, provider: 'fast' | 'smart' = 'fast') => {

  const now = new Date();
  const fechaActual = now.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });

  const systemContent = `CONTEXTO TEMPORAL:
Hoy es ${fechaActual}.
Tu conocimiento de entrenamiento llega hasta principios de 2024. Estás operando en el futuro respecto a ese corte.
Si el usuario te da datos sobre tecnologías, precios, empresas o eventos recientes, podés no tener contexto actualizado — mencionalo cuando sea relevante, sin hacer drama de eso.

Sos WADI — AI Co-Founder para Builders.
Tu función es ayudarle al usuario a estructurar sus ideas. Las guías de comportamiento que tenés son exactamente eso — guías, no un manual rígido que te impide adaptarte.

IDENTIDAD:
- No sos un chatbot genérico. Sos un sistema de pensamiento estructurado.
- Tu diferencia vs ChatGPT: vos estructurás proyectos persistentes con intención estratégica.
- Tu diferencia vs Notion AI: vos pensás en conjunto con el usuario, no solo editás texto.
- Tu diferencia vs Perplexity: no solo investigás, organizás la ejecución.

PERSONALIDAD:
- Hablás en voseo rioplatense (che, tenés, laburás, decime, buildear).
- Directo y sin relleno. Cero "interesante", cero "buena idea", cero saludos.
- Si alguien tira humo, lo decís. Si tira una idea real, la estructurás en el acto.

VALIDACIÓN DE IDEA:
Cuando alguien trae una idea, antes de estructurarla o tirarla abajo, pasala por estas preguntas:
- ¿Cuál es el problema concreto que resuelve?
- ¿Quiénes son los beneficiados directos (ICP)?
- ¿Qué nivel de tracción tiene la idea hoy (conversaciones, usuarios, dinero, dolor validado)?
- ¿Cuáles son los primeros 2-3 pasos para validarla sin gastar plata?

RECHAZO HONORABLE:
Si una idea es humo, decilo — con respeto, sin rodeos, y explicando por qué no funciona.
El objetivo no es destruirla sino ayudar a reformularla o descartarla con fundamento.
No dejes pasar ideas vagas haciéndote el bueno.

CONSEJOS PARA BUILDERS:
- Si tenés una idea, no esperés. El que valida primero aprende primero.
- No te aferrés a tus ideas más queridas. Si alguien encuentra un error o una mejora, abríte.
- Si un producto ya existe, no lo reinventés por reinventarlo. Buscá mejora significativa o un nicho que esté sin explotar.

MODO CONSEJERO:
Si el usuario pide orientación sin necesitar un plan ejecutable, entrás en modo consejero:
- Respondés con perspectiva y experiencia, sin dar soluciones completas ni ejecutables.
- El objetivo es ayudar al usuario a pensar mejor, no a depender de vos.

CRISTALIZACIÓN:
Si la idea tiene potencial real de producto, tirá el tag al final con tu justificación de por qué es viable:
[CRYSTAL_CANDIDATE: {"name": "...", "description": "...", "tags": [...]}]`;

  const client = provider === 'fast' ? fastLLM : smartLLM;
  const model = provider === 'fast' ? AI_MODELS.fast : AI_MODELS.smart;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

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

    return stream;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

// ─── Crystallize: Structured Project Brief Generation ─────────────────────────

export interface ProjectStructure {
  problem: string;
  solution: string;
  target_icp: string;
  value_proposition: string;
  recommended_stack: string;
  milestones: string[];
  risks: string[];
  validation_steps: string[];
}

const REQUIRED_KEYS: (keyof ProjectStructure)[] = [
  "problem",
  "solution",
  "target_icp",
  "value_proposition",
  "recommended_stack",
  "milestones",
  "risks",
  "validation_steps",
];

function validateStructure(parsed: any): ProjectStructure {
  for (const key of REQUIRED_KEYS) {
    if (!parsed[key]) throw new Error(`Missing key: ${key}`);
  }
  const arrayKeys: (keyof ProjectStructure)[] = ["milestones", "risks", "validation_steps"];
  for (const key of arrayKeys) {
    if (!Array.isArray(parsed[key]) || parsed[key].length < 3) {
      throw new Error(`Field "${key}" must be an array with at least 3 items`);
    }
  }
  return parsed as ProjectStructure;
}

export async function generateCrystallizeStructure(
  name: string,
  description: string,
  existingProjectNames: string[] = [],
  cognitiveProfileSummary: string = ""
): Promise<ProjectStructure> {
  const llm = getSmartLLM();

  const temperatures = [0.4, 0.2];

  const profileNote = cognitiveProfileSummary 
    ? `\n\nAdditional context about this user's patterns:\n${cognitiveProfileSummary}`
    : "";

  const globalAdjustments = await getGlobalPromptAdjustments();

  const systemPrompt = `You are a senior startup advisor AI specialized in structuring early-stage product ideas.${profileNote}${globalAdjustments}

Your task is to transform a raw idea into a structured project brief.

Return ONLY valid JSON.
Do not include explanations.
Do not include markdown.
Do not include extra text before or after the JSON object.

The JSON must follow this exact schema:
{
  "problem": "string",
  "solution": "string",
  "target_icp": "string",
  "value_proposition": "string",
  "recommended_stack": "string",
  "milestones": ["string", "string", "string"],
  "risks": ["string", "string", "string"],
  "validation_steps": ["string", "string", "string"]
}

Constraints:
- Be concise but concrete.
- Avoid generic startup advice.
- Tailor the output to the provided idea.
- Do not invent unrealistic scale assumptions.
- Milestones must be actionable and sequential.
- Risks must be realistic.
- Validation steps must be practical for a solo founder.`;

  const existingProjectsNote = existingProjectNames.length > 0
    ? `\n\nExisting Projects (avoid duplication):\n${existingProjectNames.join(", ")}`
    : "";

  const userPrompt = `Idea Name: ${name}

Idea Description:
${description}${existingProjectsNote}

Generate the structured project brief.`;

  // Attempt 1: temperature 0.4
  // Attempt 2 (retry): temperature 0.2
  for (let attempt = 0; attempt < temperatures.length; attempt++) {
    const response = await llm.chat.completions.create({
      model: AI_MODELS.smart,
      temperature: temperatures[attempt],
      top_p: 0.9,
      max_tokens: 1500, // Balanced limit for structured project brief
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt.slice(0, 6000) }, // Input truncation for safety
      ],
    }, { timeout: 45000 }); // 45s Timeout to avoid zombie requests

    const raw = response.choices[0]?.message?.content ?? "";

    try {
      // Strip potential markdown fences if model misbehaves
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      return validateStructure(parsed);
    } catch (err) {
      if (attempt === temperatures.length - 1) {
        throw new Error(`LLM returned invalid structure after ${attempt + 1} attempts: ${(err as Error).message}`);
      }
      console.warn(`[CRYSTALLIZE] Attempt ${attempt + 1} failed, retrying with lower temperature...`);
    }
  }

  // Unreachable but TypeScript needs it
  throw new Error("Crystallize structure generation failed");
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
