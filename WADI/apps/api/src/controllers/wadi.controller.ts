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

  const result = await interpretMessage(message.trim(), userId);

  return res.json(result);
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
