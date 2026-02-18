import { Router } from "express";
import { supabase } from "../supabase";

const router = Router();

router.get("/system/debug-db", async (_req, res) => {
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_KEY;

  if (!hasUrl || !hasKey) {
    return res.status(500).json({
      status: "ENV_MISSING",
      hasUrl,
      hasKey,
    });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id")
    .limit(1);

  if (error) {
    return res.status(500).json({
      status: "DB_ERROR",
      error: error.message,
    });
  }

  return res.json({
    status: "DB_OK",
    sample: data,
  });
});

export default router;
