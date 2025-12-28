import {
  isVeryShort,
  containsDesireWords,
  containsBuzzwords,
  lacksConcreteNouns,
  containsHelpSignals,
  mentionsRealProblem,
} from "./heuristics.js";

export function detectHumanPattern(text, context = {}) {
  if (!text) return "UNCLASSIFIED";

  // VAGUE_AMBITION: Short & Desire-based
  if (isVeryShort(text) && containsDesireWords(text)) {
    return "VAGUE_AMBITION";
  }

  // FAKE_DEPTH: Buzzwords & No substance
  if (containsBuzzwords(text) && lacksConcreteNouns(text)) {
    return "FAKE_DEPTH";
  }

  // RESCUE_REQUEST: Help signal & No constraints
  if (containsHelpSignals(text) && lacksConcreteNouns(text)) {
    return "RESCUE_REQUEST";
  }

  // PROCRASTINATION_LOOP: Repeated attempts (context) & No new info
  if (context.repeatedAttempts && lacksConcreteNouns(text)) {
    return "PROCRASTINATION_LOOP";
  }

  // BLOCKED_BUT_REAL: Real problem detected
  if (mentionsRealProblem(text)) {
    return "BLOCKED_BUT_REAL";
  }

  return "UNCLASSIFIED";
}
