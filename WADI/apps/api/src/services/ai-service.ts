import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

// 1. SMART LLM (OpenAI) - Para tareas complejas, tools y razonamiento
export const smartLLM = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Default OpenAI Key
});

// 2. FAST LLM (Groq) - Para chat streaming y respuestas instantáneas
export const fastLLM = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Helper to get model names
export const AI_MODELS = {
    fast: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    smart: "gpt-4o"
};
