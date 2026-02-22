
import { Request, Response, NextFunction } from "express";
import * as crypto from "crypto";
import { runBrainStream } from "../wadi-brain";
import { logger } from "../core/logger";

// In-memory cache for persona stability per conversation
// Structure: { [conversationId]: { personaId: string; turnsActive: number; messageCount: number } }
export const personaCache: Record<
  string,
  { personaId: string; turnsActive: number; messageCount: number }
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

// In-memory locks to prevent race conditions on the same project
const streamLocks: Set<string> = new Set();

interface RequestWithContext extends Request {
  user?: { id: string };
  requestId?: string;
}

export const handleChatStream = async (req: Request, res: Response) => {
  const { id } = req.params; // Project ID

  if (streamLocks.has(id)) {
    return res.status(429).json({ error: "CONCURRENT_STREAM_NOT_ALLOWED" });
  }

  streamLocks.add(id);

  // Support guests: if no auth, use an ephemeral guest ID
  const extendedReq = req as unknown as RequestWithContext;
  const userId = extendedReq.user?.id ?? `guest-${crypto.randomUUID()}`;
  const { input } = req.body;
  const requestId = extendedReq.requestId;

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const cached = personaCache[id] || { personaId: "SOCIO_IRONICO", turnsActive: 0, messageCount: 0 };
    
    // Increment message count
    cached.messageCount++;

    const { stream, personaId: selectedPersonaId } = await runBrainStream(
      userId,
      input,
      { 
        projectId: id,
        lastPersona: cached.personaId,
        turnsActive: cached.turnsActive,
        messageCount: cached.messageCount
      },
      "fast"
    );

    // Update Cache for stability logic
    if (selectedPersonaId === cached.personaId) {
        cached.turnsActive++;
    } else {
        cached.personaId = selectedPersonaId;
        cached.turnsActive = 1;
    }
    personaCache[id] = cached;

    let hasSentContent = false;

    // Stream the chunks to the client
    for await (const chunk of stream) {
      if (!chunk.choices?.[0]?.delta?.content) continue;

      const content = chunk.choices[0].delta.content;
      
      if (content.includes("CRYSTAL_CANDIDATE")) {
        logger.info({ 
          msg: "crystal_detected", 
          projectId: id, 
          userId 
        }, "A potential idea was detected for crystallization");
      }

      hasSentContent = true;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }

    if (!hasSentContent) {
      logger.warn({
        msg: "llm_empty_stream",
        userId,
        projectId: id,
        requestId,
      }, "The LLM returned an empty stream");
      res.write(`data: ${JSON.stringify({ error: "EMPTY_RESPONSE" })}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: unknown) {
    const err = error as Error & { code?: string; meta?: Record<string, unknown> };
    logger.error({ 
      msg: "chat_stream_failed", 
      error: err.message, 
      projectId: id, 
      requestId 
    }, "Error during chat streaming");

    if (err.name === "AbortError" || err.message?.includes("user aborted")) {
      if (!res.headersSent) {
        return res.status(504).json({ success: false, error: "LLM_TIMEOUT" });
      }
      res.end();
      return;
    }

    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "STREAMING_ERROR" });
    } else {
      res.end();
    }
  } finally {
    streamLocks.delete(id);
  }
};
