import OpenAI from "openai";

const getClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy", // Prevent crash on import if env missing
    timeout: 30_000,
    maxRetries: 0,
  });
};

/**
 * Executes a call to the LLM.
 * Wraps the OpenAI SDK.
 */
export async function callLLM(input: unknown): Promise<unknown> {
  // We expect input to be the messages array or an object containing it.
  // Adapting to robust usage:
  const messages = Array.isArray(input) ? input : (input as any).messages;
  
  if (!messages) {
    throw new Error("Invalid input: 'messages' required for LLM call.");
  }

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini", // Using a stable model identifier
    messages: messages,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) return {};

  try {
    return JSON.parse(content);
  } catch (e) {
    // If JSON parse fails, return the text wrapped (or throw to trigger retry logic)
    // The retry logic in runBrain catches errors.
    throw new Error("Invalid JSON response from LLM");
  }
}
