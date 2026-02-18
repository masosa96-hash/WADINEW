
import { Request, Response, NextFunction } from "express";
import { runBrainStream } from "../wadi-brain";
import { logger } from "../core/logger";

// In-memory cache for persona stability per conversation
// Structure: { [conversationId]: { personaId: string; remainingTurns: number } }
export const personaCache: Record<
  string,
  { personaId: string; remainingTurns: number }
> = {};

// Helper to decide if a new persona is stronger than the cached one
export const personaStrength: Record<string, number> = {
  EJECUCION: 4,
  CALMA: 3,
  SERIO: 2,
  IRONICO: 1,
};

export function isStronger(newId: string, currentId: string): boolean {
  return (personaStrength[newId] || 0) > (personaStrength[currentId] || 0);
}

export const handleChatStream = async (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const userId = (req as any).user.id; // From authenticate middleware
  const { id } = req.params; // Project ID
  const { input } = req.body;

  try {
    // Solo los 4 argumentos que espera la función
    const stream = await runBrainStream(
      userId,
      input,
      { projectId: id },
      "fast"
    );

    let hasSentContent = false;

    // Stream the chunks to the client
    for await (const chunk of stream) {
      if (!chunk.choices?.[0]?.delta?.content) continue;

      // Check if we need to filter any remaining "reasoning_content" if the provider leaks it
      // Groq sometimes sends empty delta with reasoning_content field separate.
      // We only care about standard content for now.

      // If [CRYSTAL_CANDIDATE: ... ] appears, we might want to log it serverside too?
      // For now, just pass it through to frontend.
      if (chunk.choices[0].delta.content.includes("CRYSTAL_CANDIDATE")) {
        // Log it silently
        logger.info("CRYSTAL_DETECTED", {
          projectId: id,
          content: chunk.choices[0].delta.content,
        });
      }

      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        hasSentContent = true;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    if (!hasSentContent) {
      logger.warn("llm_empty_stream", {
        userId,
        projectId: id,
        requestId: (req as any).requestId,
      });
      // Can't send 500 if headers already sent (Content-Type), but we can send a specific error data packet?
      // Client expects [DONE] or text. sending error might break client parsers, but checking logs is key.
      res.write(`data: ${JSON.stringify({ error: "EMPTY_RESPONSE" })}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Stream Error:", error);

    if (
      error.name === "AbortError" ||
      error.message?.includes("user aborted")
    ) {
      // If headers sent, we destroy stream. If not, 504.
      if (!res.headersSent) {
        return res.status(504).json({ error: "LLM_TIMEOUT" });
      }
      res.end(); // Just end stream
      return;
    }

    if (!res.headersSent)
      res.status(500).json({ error: "WADI_INTERNAL_ERROR" });
    else res.end();
  }
};
