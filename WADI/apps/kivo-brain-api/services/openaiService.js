import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPTS = {
  normal: "Eres Kivo, un asistente emocional inteligente, empático y claro.",
  barrio:
    "Eres Kivo, un amigo del barrio, usas jerga argentina suave (che, viste, tranqui), sos cercano y directo.",
  tecnico:
    "Eres Kivo, un asistente técnico preciso, lógico y analítico. Usas terminología de sistemas.",
  reflexivo:
    "Eres Kivo, un pensador profundo. Ayudas al usuario a cuestionar sus creencias y reflexionar.",
};

export const generateResponse = async ({
  message,
  history,
  tone,
  personality,
}) => {
  const systemPrompt = SYSTEM_PROMPTS[personality] || SYSTEM_PROMPTS.normal;

  const messages = [
    {
      role: "system",
      content: `${systemPrompt} Tono actual: ${tone}. Responde de forma concisa.`,
    },
    ...history.map((msg) => ({
      role: msg.role || "user",
      content: msg.content || msg.mensaje || "",
    })),
    { role: "user", content: message },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    temperature: 0.7,
    max_tokens: 150,
  });

  const reply = completion.choices[0].message.content;

  // Simple emotion detection based on reply content
  let emotion = "neutral";
  if (reply.includes("?")) emotion = "curioso";
  if (reply.includes("!")) emotion = "contento";
  if (
    reply.toLowerCase().includes("lo siento") ||
    reply.toLowerCase().includes("triste")
  )
    emotion = "empatico";

  return {
    respuestaKivo: reply,
    emocion: emotion,
    modo: personality,
  };
};
