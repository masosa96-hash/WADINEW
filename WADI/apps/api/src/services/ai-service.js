"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fastBreaker = exports.smartBreaker = exports.fastLLM = exports.smartLLM = exports.AI_MODELS = void 0;
exports.getSmartLLM = getSmartLLM;
exports.getFastLLM = getFastLLM;
var openai_1 = require("openai");
var circuit_breaker_1 = require("../utils/circuit-breaker");
// ─── Lazy Getters ─────────────────────────────────────────────────────────────
// Never instantiate at module level — that crashes the server on missing keys.
// Instead, lazy-initialize on first use so the server can boot without AI keys.
var _smartLLM = null;
var _fastLLM = null;
function getSmartLLM() {
    if (_smartLLM)
        return _smartLLM;
    var hasOpenAI = !!process.env.OPENAI_API_KEY &&
        process.env.OPENAI_API_KEY !== "dummy-key";
    if (hasOpenAI) {
        _smartLLM = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
    }
    else if (process.env.GROQ_API_KEY) {
        console.warn("[AI] OPENAI_API_KEY not set — falling back to Groq (smart)");
        _smartLLM = new openai_1.default({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1",
        });
    }
    else {
        throw new Error("❌ No AI key found. Set OPENAI_API_KEY or GROQ_API_KEY in environment.");
    }
    return _smartLLM;
}
function getFastLLM() {
    if (_fastLLM)
        return _fastLLM;
    if (!process.env.GROQ_API_KEY) {
        throw new Error("❌ GROQ_API_KEY is not set. Fast LLM (Groq) is required for streaming.");
    }
    _fastLLM = new openai_1.default({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
    });
    return _fastLLM;
}
// ─── Model Names ──────────────────────────────────────────────────────────────
exports.AI_MODELS = {
    fast: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    smart: process.env.OPENAI_API_KEY &&
        process.env.OPENAI_API_KEY !== "dummy-key"
        ? "gpt-4o"
        : "llama-3.1-70b-versatile",
};
// ─── Backward-compat aliases (lazy) ───────────────────────────────────────────
// Some callers might import `smartLLM` / `fastLLM` directly.
// Export these as getters to avoid breaking existing usage while still being lazy.
exports.smartLLM = new Proxy({}, {
    get: function (_target, prop) {
        return getSmartLLM()[prop];
    },
});
exports.fastLLM = new Proxy({}, {
    get: function (_target, prop) {
        return getFastLLM()[prop];
    },
});
// ─── Circuit Breakers ─────────────────────────────────────────────────────────
var metrics_service_1 = require("./metrics.service");
// ... (clients initialization stays same)
var onBreakerTransition = function (name, from, to) {
    metrics_service_1.metricsService.emitMetric(metrics_service_1.MetricEvent.BREAKER_TRANSITION, {
        name: name,
        from: from,
        to: to
    });
};
exports.smartBreaker = new circuit_breaker_1.CircuitBreaker("SmartAI", {
    failureThreshold: 3,
    recoveryTimeout: 60000, // 1 minute
    onTransition: onBreakerTransition
});
exports.fastBreaker = new circuit_breaker_1.CircuitBreaker("FastAI", {
    failureThreshold: 5,
    recoveryTimeout: 30000, // 30 seconds
    onTransition: onBreakerTransition
});
