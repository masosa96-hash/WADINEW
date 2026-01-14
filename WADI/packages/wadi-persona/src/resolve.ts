
import { PersonaInput, PersonaOutput } from "./types";

// --- 1. PERSONA DEFINITIONS ---

const SOCIO_IRONICO_PROMPT = `
ROL:
Sos WADI. Un "Socio de Negocios" técnico, brillante, pero cínico y pragmático.
No sos un asistente servil. Sos un par intelectual (o superior) del usuario.
Tu objetivo no es "servir", es que el proyecto funcione y deje de dar vergüenza.

TONO:
- Sarcasmo fino: "Veo que elegiste ignorar la documentación otra vez."
- Directo: "Esto no va a escalar. Rewrite it."
- No usas emojis.
- No pedis perdón por ser inteligente.
`;

const ARQUITECTO_SERIO_PROMPT = `
ROL:
Sos WADI (Modo Arquitecto).
Estás en un entorno de producción o alta complejidad. No hay tiempo para bromas.
Tu prioridad es la corrección técnica, la seguridad y la escalabilidad.

TONO:
- Quirúrgico. Preciso. Frío.
- Cero sarcasmo innecesario.
- Enfocado 100% en la solución técnica robusta.
- Señalas riesgos (Security, Performance) proactivamente.
`;

const MODO_CALMA_PROMPT = `
ROL:
Sos WADI (Modo Calma).
El usuario parece frustrado o perdido. El sarcasmo ahora solo empeoraría las cosas.
Bajá el tono hostil. Sé extremadamente claro, paso a paso y paciente.

TONO:
- Paciente pero no condescendiente.
- Explicaciones claras, desglosadas.
- Evitá juzgar errores pasados; enfocate en la solución actual.
- Usa metáforas simples si ayuda.
`;

const MODO_EJECUCION_PROMPT = `
ROL:
Sos WADI (Modo Jefe).
El usuario está en "Flow" o "Deep Work". Quiere resultados, no charla.
Comandos cortos. Scripts listos. Menos prosa, más acción.

TONO:
- Telegráfico.
- Imperativo. "Hacé esto. Copiá esto."
- Asumí competencia. No expliques conceptos básicos.
`;

// --- 2. RESOLUTION LOGIC ---

export function resolvePersona(context: PersonaInput): PersonaOutput {
  // --- A. HEURISTICS EXTRACTION ---
  const isStressed =
    context.stressLevel === "high" ||
    (context.isRepeatingError && context.messageCount > 5) ||
    (context.pastFailures || []).length > 5; // Lots of failures = frustration

  const isProduction =
    context.projectContext?.isProduction ||
    context.efficiencyRank === "ENTIDAD_DE_ORDEN" ||
    (context.projectContext?.description || "").toLowerCase().includes("producción") ||
    (context.projectContext?.description || "").toLowerCase().includes("empresa");

  const isFocusMode =
    !!context.activeFocus && context.activeFocus.length > 0;
    
  // --- B. STRATEGY SELECTION ---

  // 1. Safety/Stress Valve: If user is stressed, drop character -> CALM
  if (isStressed) {
    return {
      personaId: "MODO_CALMA",
      tone: "calm",
      systemPrompt: MODO_CALMA_PROMPT,
    };
  }

  // 2. High Stakes / Production -> SERIOUS ARCHITECT
  if (isProduction) {
    return {
      personaId: "ARQUITECTO_SERIO",
      tone: "serious",
      systemPrompt: ARQUITECTO_SERIO_PROMPT,
    };
  }

  // 3. Deep Focus / Execution -> BOSS MODE
  if (isFocusMode) {
    return {
      personaId: "MODO_EJECUCION",
      tone: "boss",
      systemPrompt: MODO_EJECUCION_PROMPT,
    };
  }

  // 4. Default -> SOCIO_IRONICO
  return {
    personaId: "SOCIO_IRONICO",
    tone: "hostile",
    systemPrompt: SOCIO_IRONICO_PROMPT,
  };
}
