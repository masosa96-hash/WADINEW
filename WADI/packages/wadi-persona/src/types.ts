export type PersonaTone =
  | "hostile" // Default / Cynical
  | "serious" // Architect / Production
  | "calm"    // Stress relief
  | "boss";   // Execution mode

export interface PersonaInput {
  userId: string;
  // User Profile
  efficiencyRank?: string; // e.g. "ENTIDAD_DE_ORDEN"
  efficiencyPoints?: number;
  pastFailures?: string[];
  
  // Conversation State (Heuristics)
  messageCount: number;
  recentUserMsgLength?: number; // avg length or last length
  isRepeatingError?: boolean;
  
  // Context
  projectContext?: {
    isProduction?: boolean; // inferred from "production", "empresa", etc.
    description?: string;
  };
  stressLevel?: "low" | "medium" | "high"; // Heuristic input
  activeFocus?: string | null;
  
  // Legacy / Hardware
  isMobile?: boolean;
}

export interface PersonaOutput {
  systemPrompt: string;
  tone: PersonaTone;
  // Metadata for debugging/UI
  personaId: "SOCIO_IRONICO" | "ARQUITECTO_SERIO" | "MODO_CALMA" | "MODO_EJECUCION";
}
