export type Tone = "hostile" | "neutral" | "surgical";

export interface Risk {
  code: string;
  severity: "low" | "medium" | "high";
  description: string;
}

export interface WadiDecision {
  response: string;
  tone: Tone;
  risks: Risk[];
  smokeIndex: number;
}

export interface WadiContext {
  userId: string;
  message: string;
  history: unknown[];
}

export function wadiBrain(context: WadiContext): WadiDecision {
  // implementación actual (placeholder per migration instructions)
  console.log("WADI Brain Context:", context);
  return {
    response: "WADI_BRAIN_NOT_FULL_IMPL",
    tone: "neutral",
    risks: [],
    smokeIndex: 0,
  };
}
