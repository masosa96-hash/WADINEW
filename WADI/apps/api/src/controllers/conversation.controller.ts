
import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase";
import { AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth";

export const listConversations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = user!.id as any;

  const { data } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  res.json(data);
};

export const getConversation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const user = req.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = user!.id as any;

  // 1. Get Conversation Metadata
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("*")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq("id", id as any)
    .eq("user_id", userId)
    .single();

  if (convError) {
    throw new AppError("DB_ERROR", convError.message, 500);
  }

  if (!conversation || typeof conversation !== "object") {
    throw new AppError("NOT_FOUND", "Conversation not found", 404);
  }

  // 2. Get Messages
  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("*")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq("conversation_id", id as any)
    .order("created_at", { ascending: true });

  if (msgError) throw new AppError("DB_ERROR", msgError.message);

  res.json({ ...(conversation as Record<string, unknown>), messages });
};

export const deleteConversation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = user!.id as any;

  await supabase
    .from("conversations")
    .delete()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq("id", req.params.id as any)
    .eq("user_id", userId);

  res.status(204).send();
};

export const bulkDeleteConversations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = user!.id as any;

  const { conversationIds } = req.body; // Recibe ["id1", "id2", ...]

  if (
    !conversationIds ||
    !Array.isArray(conversationIds) ||
    conversationIds.length === 0
  ) {
    return res.status(400).json({ error: "No IDs provided for bulk delete." });
  }

  const { error } = await supabase
    .from("conversations")
    .delete()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .in("id", conversationIds as any)
    .eq("user_id", userId);

  if (error) {
    console.error("Bulk Delete Error:", error);
    return res
      .status(500)
      .json({ error: "F en el chat: No se pudo limpiar el caos." });
  }

  // User specified success message
  res.status(200).json({ message: "Workspace limpio. Del caos al plan." });
};
