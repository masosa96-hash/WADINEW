/**
 * wadi.controller.ts
 *
 * Controller Express para el pipeline de Wadi.
 * Expone dos endpoints:
 *   POST /wadi/interpret  — procesa un mensaje del usuario
 *   POST /wadi/reset      — reinicia el estado conversacional
 */

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error.middleware";
import { interpretMessage, resetConversationState } from "../services/wadi-interpret.service";

export const handleWadiInterpret = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Fallback to session header for guests
  const userId = req.user?.id || (req.headers["x-wadi-session"] as string) || "GUEST_SESSION";

  const { message } = req.body;

  if (!message || typeof message !== "string" || message.trim() === "") {
    throw new AppError("BAD_REQUEST", "El campo 'message' es requerido", 400);
  }

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const result = await interpretMessage(message.trim(), userId);

    // Simulate streaming for the message part to give a better UX
    const fullMessage = result.message || "";
    const words = fullMessage.split(" ");
    
    // Send message content in small chunks
    for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i === words.length - 1 ? "" : " ");
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        // Tiny delay for UX
        await new Promise(r => setTimeout(r, 15));
    }

    // Send the final result with all metadata (stage, intent, etc) and done signal
    res.write(`data: ${JSON.stringify(result)}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    if (!res.headersSent) {
      return next(error);
    }
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

export const handleWadiReset = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id || (req.headers["x-wadi-session"] as string) || "GUEST_SESSION";

  await resetConversationState(userId);

  return res.json({ success: true, message: "Estado conversacional reiniciado." });
};
