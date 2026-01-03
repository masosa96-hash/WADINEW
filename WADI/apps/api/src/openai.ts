import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const useGroq = !!process.env.GROQ_API_KEY;

export const openai = new OpenAI({
  apiKey: useGroq
    ? process.env.GROQ_API_KEY
    : process.env.OPENAI_API_KEY || "dummy-key",
  baseURL: useGroq ? "https://api.groq.com/openai/v1" : undefined,
});

export const AI_MODEL = useGroq
  ? process.env.GROQ_MODEL || "llama-3.1-8b-instant"
  : "gpt-4o";
