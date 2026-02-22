import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { supabase } from "../supabase";

export const getSnapshots = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, error } = await supabase
      .from("daily_snapshots")
      .select("*")
      .order("date", { ascending: false })
      .limit(30);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    next(err);
  }
};
