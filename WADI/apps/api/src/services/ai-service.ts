import OpenAI from 'openai';
import { CircuitBreaker } from '../utils/circuit-breaker';

// ─── Lazy Getters ─────────────────────────────────────────────────────────────
// Never instantiate at module level — that crashes the server on missing keys.
// Instead, lazy-initialize on first use so the server can boot without AI keys.

let _smartLLM: OpenAI | null = null;
let _fastLLM: OpenAI | null = null;

export function getSmartLLM(): OpenAI {
  if (_smartLLM) return _smartLLM;

  const hasOpenAI =
    !!process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "dummy-key";

  if (hasOpenAI) {
    _smartLLM = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } else if (process.env.GROQ_API_KEY) {
    console.warn("[AI] OPENAI_API_KEY not set — falling back to Groq (smart)");
    _smartLLM = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  } else {
    throw new Error(
      "❌ No AI key found. Set OPENAI_API_KEY or GROQ_API_KEY in environment."
    );
  }

  return _smartLLM;
}

export function getFastLLM(): OpenAI {
  if (_fastLLM) return _fastLLM;

  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "❌ GROQ_API_KEY is not set. Fast LLM (Groq) is required for streaming."
    );
  }

  _fastLLM = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  return _fastLLM;
}

// ─── Model Names ──────────────────────────────────────────────────────────────
export const AI_MODELS = {
  fast: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  smart:
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "dummy-key"
      ? "gpt-4o"
      : "llama-3.1-70b-versatile",
};

// ─── Backward-compat aliases (lazy) ───────────────────────────────────────────
// Some callers might import `smartLLM` / `fastLLM` directly.
// Export these as getters to avoid breaking existing usage while still being lazy.
export const smartLLM = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getSmartLLM() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const fastLLM = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getFastLLM() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ─── Circuit Breakers ─────────────────────────────────────────────────────────
import { metricsService, MetricEvent } from './metrics.service';

// ... (clients initialization stays same)

const onBreakerTransition = (name: string, from: any, to: any) => {
  metricsService.emitMetric(MetricEvent.BREAKER_TRANSITION, {
    name,
    from,
    to
  });
};

export const smartBreaker = new CircuitBreaker("SmartAI", { 
  failureThreshold: 3, 
  recoveryTimeout: 60000, // 1 minute
  onTransition: onBreakerTransition
});

export const fastBreaker = new CircuitBreaker("FastAI", { 
  failureThreshold: 5, 
  recoveryTimeout: 30000, // 30 seconds
  onTransition: onBreakerTransition
});
