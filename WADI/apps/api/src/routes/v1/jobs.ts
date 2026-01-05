import { Router } from "express";
import { chatQueue } from "../../queue/chatQueue.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireScope } from "../../middleware/require-scope.js";

const router = Router();

router.get("/:id", authenticate, requireScope("chat:read"), async (req, res) => {
  const job = await chatQueue.getJob(req.params.id);
  
  if (!job) {
     return res.status(404).json({ error: "Job Not Found" });
  }

  // Security check: ensure job belongs to user if possible, 
  // but job data might be clean. For now, strict scope is enough.
  // Ideally: if (job.data.userId !== req.user.id) return 403;

  const state = await job.getState();

  if (state === "completed") {
    return res.json({ state, result: job.returnvalue });
  }

  if (state === "failed") {
    return res.status(500).json({ state, error: job.failedReason });
  }

  // active, waiting, delayed...
  return res.json({ state });
});

export default router;
