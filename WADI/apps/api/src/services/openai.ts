import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("OPENAI_API_KEY is not set. Brain will be lobotomized.");
}

const openai = new OpenAI({
  apiKey: apiKey,
});

export const getChatCompletion = async (
  prompt: string,
  model: string = "gpt-3.5-turbo"
) => {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};
