import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const useGroq = !!process.env.GROQ_API_KEY;
const apiKey = useGroq ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn(`Missing API Key for ${useGroq ? 'Groq' : 'OpenAI'}. Brain will be lobotomized.`);
}

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: useGroq ? "https://api.groq.com/openai/v1" : undefined,
});

export const getChatCompletion = async (
  prompt: string,
  model: string = "gpt-3.5-turbo"
) => {
  try {
    const aiModel = useGroq
      ? (process.env.GROQ_MODEL || "llama-3.1-8b-instant")
      : model;

    const response = await openai.chat.completions.create({
      model: aiModel,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI API Error:", error);
    throw error;
  }
};

