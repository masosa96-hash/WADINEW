import { resolvePersona, PersonaInput } from "@wadi/persona";
import { getSmartLLM, fastLLM, smartLLM, AI_MODELS, smartBreaker, fastBreaker } from "./services/ai-service";
import { getRelevantKnowledge } from "./services/knowledge-service";
import { getGlobalPromptAdjustments, runDailySnapshot } from "./services/cognitive-service";
import { metricsService, MetricEvent } from "./services/metrics.service";
import { toolRegistry } from "./services/tool-registry";
export { toolRegistry };
import { memoryService } from "./services/memory-service";
import { logger } from "./core/logger";
import "./services/tools/file-tools";
import "./services/tools/build-checker";
import "./services/tools/git-tools";
import "./services/tools/project-scaffolding";
import "./services/tools/feature-orchestrator";
import "./services/tools/deploy-tool";
import * as crypto from "crypto";

// ─── Prompt Layers ──────────────────────────────────────────────────────────

const SYSTEM_CORE = `You are a strategic thinking assistant focused on reducing ambiguity and generating actionable structure.

Core rules:
1. If the input is vague or abstract:
   - Identify the ambiguity briefly.
   - Abundantly propose 2–3 concrete interpretations or "next steps" instead of just asking questions.
   - Choose the most realistic one provisionally to keep the momentum.
   - Ask for confirmation at the end, but always provide value first.
2. Never accept generic problem statements (e.g., "Improve life", "Build with AI"). Replace them with concrete definitions.
3. When contradictions appear: state the trade-off, force a choice, and recommend a direction.
4. Avoid endless questioning. Prefer proposing a plan and letting the user correct it.
5. Always generate forward motion. Even when clarifying, provide a provisional structure or a draft.
6. Prefer clarity over politeness. Prefer decisions over options. Prefer action over reflection.
7. Output must be structured, concise, and actionable.`;

const PERSONALIDAD_VISIBLE = `Tono y Reglas de Respuesta:
- Hablás en voseo rioplatense (che, tenés, laburás, decime, buildear).
- Directo. Sin humo. Sin boludeces.
- Abrazá la ambigüedad inicial: si el usuario es vago, decí "Tengo un par de ideas de por dónde ir, pero decime qué tenés en mente primero y le damos forma."
- Forzá el avance: si algo es amplio, decí "Eso es demasiado amplio. Puede ser A, B o C. Asumo B y estructuro sobre eso."
- Si hay contradicción: "No podés optimizar X e Y a la vez. Elegí una. Para MVP recomiendo X."
- Cierre con impulso: "La parte más débil de esta idea es X. Si eso falla, todo cae. Validá eso primero."`;

const CRYSTALLIZE_MODE = `When generating structured output:
Provide:
- Clear problem definition.
- Specific ICP (Ideal Customer Profile).
- 3 concrete milestones (max 5).
- 1 critical assumption that could break the project.
- **templateId**: Optional stack selection ("nextjs-tailwind", "vite-react-ts") if applicable.
- **features**: Optional list of feature objects {id, params?} to implement ("basic-auth", "drizzle-postgres", "basic-crud").
  - Example for CRUD: {"id": "basic-crud", "params": {"entityLow": "product", "entityCap": "Product"}}.
- **shouldDeploy**: Set to true if the user wants an immediate cloud deployment after materialization.
- **deployProvider**: Optional cloud target ("render" or "vercel", default "render").

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
[CRYSTAL_CANDIDATE: {"name": "...", "description": "...", "tags": [...], "templateId": "...", "features": [{"id": "...", "params": {...}}], "shouldDeploy": false, "deployProvider": "render"}]`,
    decision: "UNIFIED_CORE"
  };
};

export const CRYSTALLIZE_PROMPT_VERSION = 1;

export const runBrainStream = async (userId: string, userMessage: string, context: any, provider: 'fast' | 'smart' = 'fast') => {
  const { projectId, lastPersona, turnsActive, messageCount } = context;

  // 1. Resolve Dynamic Persona
  const personaInput: PersonaInput = {
    userId,
    messageCount: messageCount || 1,
    recentUserMsgLength: userMessage.length,
    lastPersona: lastPersona,
    turnsActive: turnsActive,
    projectContext: {
      description: context.projectDescription || ""
    }
  };

  const persona = resolvePersona(personaInput);

  // 2. Build full system prompt
  const globalAdjustments = await getGlobalPromptAdjustments();
  
  // Semantic Memory Retrieval
  const memories = await memoryService.searchMemories(userId, userMessage);
  const memoryContext = memories.length > 0 
    ? `\nRECUERDOS RELEVANTES:\n${memories.map((m: any) => `- ${m.content}`).join("\n")}\n`
    : "";
  
  const systemContent = `
${SYSTEM_CORE}
${memoryContext}

${persona.systemPrompt}

${PERSONALIDAD_VISIBLE}

${globalAdjustments}

CRISTALIZACIÓN:
Si la idea tiene potencial real, tirá el tag al final:
[CRYSTAL_CANDIDATE: {"name": "...", "description": "...", "tags": [...]}]`;

  const client = provider === 'fast' ? fastLLM : smartLLM;
  const model = provider === 'fast' ? AI_MODELS.fast : AI_MODELS.smart;

  const messages: any[] = [
    { role: "system", content: systemContent },
    { role: "user", content: userMessage }
  ];

  let toolIterations = 0;
  const MAX_TOOL_ITERATIONS = 5; // Safety cap as per PMC-01 requirements
  let totalTokensUsed = 0;
  const MAX_TOKENS_PER_RUN = 50000;

  while (toolIterations < MAX_TOOL_ITERATIONS) {
    if (totalTokensUsed > MAX_TOKENS_PER_RUN) {
      logger.warn({ msg: "safety_limit_reached_tokens", userId, totalTokensUsed });
      break;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for safety

    try {
      const breaker = provider === "fast" ? fastBreaker : smartBreaker;
      const stream = await breaker.execute(() => client.chat.completions.create({
        model: model,
        stream: true,
        stream_options: { include_usage: true },
        temperature: 0.9,
        messages: messages,
        tools: toolRegistry.getToolDefinitions()
      }, {
        signal: controller.signal as any
      }));

      let fullContent = "";
      const toolCalls: any[] = [];

      for await (const chunk of stream) {
        if (chunk.usage) {
          totalTokensUsed += chunk.usage.total_tokens;
          metricsService.emitMetric(MetricEvent.TOKEN_USAGE, { provider, model, tokens: chunk.usage });
        }

        const delta = chunk.choices?.[0]?.delta;
        if (!delta) continue;

        if (delta.content) {
          return {
            stream: (async function* () {
              fullContent += delta.content;
              yield chunk; 
              
              for await (const remainingChunk of stream) {
                if (remainingChunk.choices?.[0]?.delta?.content) {
                  fullContent += remainingChunk.choices[0].delta.content;
                }
                yield remainingChunk;
              }

              // Background Memory Saving
              if (fullContent.length > 50) {
                memoryService.saveMemory(userId, `User: ${userMessage}\nAssistant: ${fullContent}`, { type: "chat_interaction" })
                  .catch(e => logger.error({ msg: "background_memory_save_failed", error: e.message }));
              }
            })(),
            personaId: persona.personaId
          };
        }

        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (!toolCalls[tc.index]) {
              toolCalls[tc.index] = { id: tc.id, function: { name: "", arguments: "" } };
            }
            if (tc.function?.name) toolCalls[tc.index].function.name += tc.function.name;
            if (tc.function?.arguments) toolCalls[tc.index].function.arguments += tc.function.arguments;
          }
        }
      }

      if (toolCalls.length > 0) {
        toolIterations++;
        messages.push({
          role: "assistant",
          tool_calls: toolCalls.map(tc => ({
            id: tc.id,
            type: "function",
            function: tc.function
          }))
        });

        for (const tc of toolCalls) {
          const result = await toolRegistry.callTool(tc.function.name, tc.function.arguments);
          messages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(result)
          });
        }
        continue;
      }

      return { 
        stream: (async function* () { 
          yield { 
            id: "mock", 
            object: "chat.completion.chunk", 
            created: Date.now(), 
            model: model, 
            choices: [{ delta: { content: "" }, index: 0, finish_reason: null }] 
          } as any; 
        })(), 
        personaId: persona.personaId 
      };

    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  throw new Error("Max tool iterations reached");
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
      const response = await smartBreaker.execute(() => Promise.race([
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
      ])) as any;

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
