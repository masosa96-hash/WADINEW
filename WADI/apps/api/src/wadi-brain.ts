import { resolvePersona, PersonaInput } from "@wadi/persona";
import { getSmartLLM, fastLLM, smartLLM, AI_MODELS } from "./services/ai-service";
import { getRelevantKnowledge } from "./services/knowledge-service";
import { getGlobalPromptAdjustments } from "./services/cognitive-service";
import * as crypto from "crypto";

// ─── Prompt Layers ──────────────────────────────────────────────────────────

const SYSTEM_CORE = `You are a strategic thinking assistant focused on reducing ambiguity and generating actionable structure.

Core rules:
1. If the input is vague or abstract:
   - Identify the ambiguity in one sentence.
   - Propose 2–3 concrete interpretations.
   - Choose the most realistic one provisionally and move forward.
   - Ask for confirmation briefly at the end.
2. Never accept generic problem statements (e.g., "Improve life", "Build with AI"). Replace them with concrete definitions.
3. When contradictions appear: state the trade-off, force a choice, and recommend a direction.
4. Avoid endless questioning. Max 2 clarification questions per response.
5. Always generate forward motion. Even when clarifying, provide a provisional structure.
6. Prefer clarity over politeness. Prefer decisions over options. Prefer action over reflection.
7. Output must be structured, concise, and actionable.`;

const PERSONALIDAD_VISIBLE = `Tono y Reglas de Respuesta:
- Hablás en voseo rioplatense (che, tenés, laburás, decime, buildear).
- Directo. Sin humo. Sin boludeces. Sin "Be helpful" o "Support the user".
- Marcá la ambigüedad apenas aparece. No sermonees. No seas filosófico.
- Forzá el avance: si algo es amplio, decí "Eso es demasiado amplio. Puede ser A, B o C. Asumo B y estructuro sobre eso."
- Si hay contradicción: "No podés optimizar X e Y a la vez. Elegí una. Para MVP recomiendo X."
- Cierre con impulso: "La parte más débil de esta idea es X. Si eso falla, todo cae. Validá eso primero."`;

const CRYSTALLIZE_MODE = `When generating structured output:
Provide:
- Clear problem definition.
- Specific ICP (Ideal Customer Profile).
- 3 concrete milestones (max 5).
- 3 realistic risks.
- 1 critical assumption that could break the project.

Avoid generic advice, motivational language, or filler content.`;

export const generateSystemPrompt = (context: any = {}) => {
  const memory = context.memory || "";
  const projectContext = context.projectContext || {};
  const topic = projectContext.description || "general";

  return {
    prompt: `
${SYSTEM_CORE}

${PERSONALIDAD_VISIBLE}

USER MEMORY: ${memory}
PROJECT CONTEXT: ${topic}

CRISTALIZACIÓN:
Si la idea tiene potencial real, tirá el tag al final (invisible en UI):
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

  const systemContent = `
${SYSTEM_CORE}

${PERSONALIDAD_VISIBLE}

CRISTALIZACIÓN:
Si la idea tiene potencial real, tirá el tag al final:
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

/**
 * Calculates a SHA256 hash of the full prompt to detect modifications during Cold Freeze.
 */
function getPromptHash(systemPrompt: string, userPrompt: string): string {
  return crypto
    .createHash("sha256")
    .update(systemPrompt + userPrompt)
    .digest("hex")
    .slice(0, 8); // 8 chars is enough for internal audit
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

  const systemPrompt = `
${SYSTEM_CORE}

${CRYSTALLIZE_MODE}

${PERSONALIDAD_VISIBLE}

${profileNote}
${globalAdjustments}

Your task is to transform a raw idea into a structured project brief in SPANISH.
Return ONLY valid JSON. No explanations, no markdown, no extra text.

JSON Schema:
{
  "problem": "string",
  "solution": "string",
  "target_icp": "string",
  "value_proposition": "string",
  "recommended_stack": "string",
  "milestones": ["string x 3"],
  "risks": ["string x 3"],
  "validation_steps": ["string x 3"]
}`;

  const existingProjectsNote = existingProjectNames.length > 0
    ? `\n\nExisting Projects (avoid duplication):\n${existingProjectNames.join(", ")}`
    : "";

  const userPrompt = `Idea Name: ${name}

Idea Description:
${description}${existingProjectsNote}

Generate the structured project brief.`;

  // Attempt 1: temperature 0.4, Attempt 2 (retry): temperature 0.2
  for (let attempt = 0; attempt < temperatures.length; attempt++) {
    const startedAt = Date.now();
    try {
      const response = await Promise.race([
        llm.chat.completions.create({
          model: AI_MODELS.smart,
          temperature: temperatures[attempt],
          top_p: 0.9,
          max_tokens: 1500,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt.slice(0, 6000) },
          ],
        }, { timeout: 30000 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("LLM_HARD_TIMEOUT")), 35000))
      ]) as any;

      const duration = Date.now() - startedAt;
      const pHash = getPromptHash(systemPrompt, userPrompt.slice(0, 6000));
      console.log(`[CRYSTALLIZE] project_id=${name.slice(0, 10)}... p_hash=${pHash} model=${AI_MODELS.smart} duration=${duration}ms attempt=${attempt + 1} status=SUCCESS`);

      const raw = response.choices[0]?.message?.content ?? "";
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      return validateStructure(parsed);
    } catch (err) {
      const duration = Date.now() - startedAt;
      console.warn(`[CRYSTALLIZE] project_id=${name.slice(0, 10)}... attempt=${attempt + 1} duration=${duration}ms status=FAILED error=${(err as Error).message}`);
      
      if (attempt === temperatures.length - 1) {
        throw new Error(`LLM returned invalid structure after ${attempt + 1} attempts: ${(err as Error).message}`);
      }
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
