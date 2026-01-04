export type PersonaTone =
  | "hostile"
  | "neutral"
  | "surgical"
  | "silent";

export interface PersonaInput {
  userId: string;
  efficiencyRank: number;
  pastFailures: string[];
  messageCount: number;
  contextFlags: {
    isMobile: boolean;
    isReturningUser: boolean;
    isUnderTimePressure: boolean;
  };
}

export interface PersonaOutput {
  systemPrompt: string;
  tone: PersonaTone;
  verbosity: 1 | 2 | 3;
}
