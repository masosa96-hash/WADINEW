
import { PersonaInput, PersonaOutput } from "./types";
import { 
    SOCIO_IRONICO_PROMPT, 
    ARQUITECTO_SERIO_PROMPT, 
    MODO_CALMA_PROMPT, 
    MODO_EJECUCION_PROMPT 
} from "./prompts";

// --- 2. RESOLUTION LOGIC ---

// Helper: Determine Persona Strength (Higher = Sticky)
const getPersonaStrength = (id?: string) => {
  switch (id) {
    case "MODO_CALMA": return 3;     // Highest priority override
    case "ARQUITECTO_SERIO": return 2;
    case "MODO_EJECUCION": return 2;
    case "SOCIO_IRONICO": return 1;  // Default weak state
    default: return 0;
  }
};

const getPersonaById = (
    id: string, 
    reason: string, 
    confidence: "low" | "medium" | "high",
    signals: PersonaOutput['signals']
): PersonaOutput => {
    const base = {
        confidence,
        signals,
        reason,
        justification: reason
    };

    switch (id) {
        case "MODO_CALMA": return { ...base, personaId: "MODO_CALMA", tone: "calm", systemPrompt: MODO_CALMA_PROMPT };
        case "ARQUITECTO_SERIO": return { ...base, personaId: "ARQUITECTO_SERIO", tone: "serious", systemPrompt: ARQUITECTO_SERIO_PROMPT };
        case "MODO_EJECUCION": return { ...base, personaId: "MODO_EJECUCION", tone: "boss", systemPrompt: MODO_EJECUCION_PROMPT };
        case "SOCIO_IRONICO":
        default:
        return { ...base, personaId: "SOCIO_IRONICO", tone: "hostile", systemPrompt: SOCIO_IRONICO_PROMPT };
  }
};

// --- 2. RESOLUTION LOGIC ---

export function resolvePersona(context: PersonaInput): PersonaOutput {
  // --- A. HEURISTICS EXTRACTION ---
  // Count robust signals
  const failuresCount = (context.pastFailures || []).length;
  
  const isStressed =
    context.stressLevel === "high" ||
    (context.isRepeatingError && context.messageCount > 5) ||
    failuresCount > 3;

  const isProduction =
    context.projectContext?.isProduction ||
    context.efficiencyRank === "ENTIDAD_DE_ORDEN" ||
    (context.projectContext?.description || "").toLowerCase().includes("producción") ||
    (context.projectContext?.description || "").toLowerCase().includes("empresa");

  const isFocusMode =
    !!context.activeFocus && context.activeFocus.length > 0;

  const signals = {
      stressScore: context.stressLevel,
      failures: failuresCount,
      projectType: isProduction ? "production" : "standard" as "production" | "standard",
      isRepeatingError: context.isRepeatingError,
      isFocusMode: isFocusMode
  };

  // --- B. CANDIDATE SELECTION ---
  let candidateId = "SOCIO_IRONICO";
  let candidateReason = "Default state";
  let confidence: "low" | "medium" | "high" = "low";

  if (isStressed) {
    candidateId = "MODO_CALMA";
    candidateReason = "User shows signs of stress/frustration";
    confidence = "high"; // Stress override is high confidence
  } else if (isProduction) {
    candidateId = "ARQUITECTO_SERIO";
    candidateReason = "Production/High-stakes context detected";
    confidence = "medium";
  } else if (isFocusMode) {
    candidateId = "MODO_EJECUCION";
    candidateReason = "Deep focus mode active";
    confidence = "high"; // Explicit user intent
  } else {
      // Default
      confidence = "low";
  }

  // --- C. ANTI-FLAPPING / STABILITY CHECK ---
  // If we have history, check if we should stick to the old persona
  if (context.lastPersona && context.turnsActive !== undefined) {
    const MIN_TURNS = 3; // N turns to cache
    const currentStrength = getPersonaStrength(context.lastPersona);
    const candidateStrength = getPersonaStrength(candidateId);

    // If we haven't reached N turns yet...
    if (context.turnsActive < MIN_TURNS) {
      // Only switch if the new candidate is STRONGER (e.g. going from Irony -> Calm is allowed)
      // Going from Calm -> Irony is blocked if < N turns.
      if (candidateStrength <= currentStrength && candidateId !== context.lastPersona) {
        // OVERRIDE: Keep old persona
        // But we report the signals of the *new* reality, just the decision is stuck.
        return getPersonaById(
            context.lastPersona, 
            `Anti-flapping: Stuck to ${context.lastPersona} (Strength ${currentStrength} >= ${candidateStrength})`,
            "high", // Artificial high confidence because we are forcing it
            signals
        );
      }
    }
  }

  // Return the selected candidate
  return getPersonaById(candidateId, candidateReason, confidence, signals);
}
