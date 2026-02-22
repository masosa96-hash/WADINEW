
import { Router, Request, Response, NextFunction } from "express";
import { authenticate, AuthenticatedRequest } from "./middleware/auth";
import { requireScope } from "./middleware/require-scope";

import {
  listProjects,
  getProject,
  crystallizeProject,
  updateProjectStructure,
  bulkDeleteProjects,
} from "./controllers/project.controller";
import {
  listConversations,
  getConversation,
  deleteConversation,
  bulkDeleteConversations,
} from "./controllers/conversation.controller";
import { handleChatStream } from "./controllers/ai.controller";
import { listRuns } from "./controllers/runsController";
import { getSnapshots } from "./controllers/system.controller";
import { rateLimiter, expensiveRateLimiter, adminRateLimiter, globalBudgetGuard } from "./middleware/rateLimiter";
const router = Router();
import { runGlobalMetaAnalysis } from "./services/cognitive-service";

// Helper: Async Wrapper
const asyncHandler = (
  fn: (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => Promise<void | unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };
};

/* =========================================
   PROJECTS ROUTES
   ========================================= */

router.get("/projects", authenticate(), asyncHandler(listProjects));

router.get("/projects/:id", authenticate(), asyncHandler(getProject));

router.post(
  "/projects/crystallize",
  authenticate(),
  globalBudgetGuard,
  expensiveRateLimiter,
  asyncHandler(crystallizeProject)
);

router.delete(
  "/projects/bulk",
  authenticate(),
  asyncHandler(bulkDeleteProjects)
);

router.patch(
  "/projects/:id/structure",
  authenticate(),
  asyncHandler(updateProjectStructure)
);

/* =========================================
   RUNS / CHAT ROUTES
   ========================================= */

// List Runs (History)
router.get(
  "/projects/:id/runs",
  authenticate(),
  asyncHandler(listRuns)
);

// New Chat Run (Stream) — optional auth, guests allowed
router.post("/projects/:id/runs", authenticate(true), handleChatStream);

/* =========================================
   CONVERSATIONS ROUTES
   ========================================= */

router.get(
  "/conversations",
  authenticate(),
  asyncHandler(listConversations)
);

router.get(
  "/conversations/:id",
  authenticate(),
  asyncHandler(getConversation)
);

router.delete(
  "/conversations/:id",
  authenticate(),
  asyncHandler(deleteConversation)
);

router.delete(
  "/conversations/bulk",
  authenticate(),
  asyncHandler(bulkDeleteConversations)
);

/* =========================================
   USER / SYSTEM ROUTES
   ========================================= */

// Update User Preferences
router.patch(
  "/user/preferences",
  authenticate(),
  asyncHandler(async (req, res) => {
    // This could also be moved to a user.controller.ts if it grows
    // For now, it's small enough to keep inline or TODO refactor
    const { supabase } = await import("./supabase");
    const user = req.user;
    const { naturalness_level, active_persona } = req.body;

    const { error } = await supabase.auth.updateUser({
      data: {
        naturalness_level,
        active_persona,
      },
    });

    if (error) throw new Error(error.message);

    res.json({ message: "Preferences updated", naturalness_level, active_persona });
  })
);

// Maintenance: Trigger Global Meta-Analysis
router.post(
  "/system/meta-analysis",
  authenticate(),
  requireScope("admin:*"),
  adminRateLimiter,
  asyncHandler(async (req, res) => {
    await runGlobalMetaAnalysis();
    res.json({ message: "Global meta-analysis completed" });
  })
);

// Get Daily Snapshots (Metrics)
router.get(
  "/system/snapshots",
  authenticate(),
  requireScope("admin:*"),
  adminRateLimiter,
  asyncHandler(getSnapshots)
);

export default router;
