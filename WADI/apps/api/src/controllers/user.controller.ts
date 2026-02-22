import { Response, NextFunction } from "express";
import { supabase } from "../supabase";
import { AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth";
import { UserPreferences } from "../schemas/user.schema";

export const updatePreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { naturalness_level, active_persona } = req.body as UserPreferences;
  
  const { data, error } = await supabase.auth.updateUser({
    data: {
      naturalness_level,
      active_persona,
    },
  });

  if (error) throw new AppError("AUTH_ERROR", error.message, 400);

  res.json({ 
    message: "Preferences updated", 
    naturalness_level: data.user.user_metadata.naturalness_level, 
    active_persona: data.user.user_metadata.active_persona 
  });
};
