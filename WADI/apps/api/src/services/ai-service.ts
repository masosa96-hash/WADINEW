import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

// 1. SMART LLM (OpenAI) - Para tareas complejas, tools y razonamiento
// 1. SMART LLM (OpenAI or Groq Fallback)
// Si no hay API Key de OpenAI, usamos Groq con un modelo más potente (Llama 70B)
const useOpenAI = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "dummy-key";

export const smartLLM = useOpenAI
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

// 2. FAST LLM (Groq) - Para chat streaming y respuestas instantáneas
export const fastLLM = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Helper to get model names
export const AI_MODELS = {
    fast: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    smart: useOpenAI ? "gpt-4o" : "llama-3.1-70b-versatile"
};
