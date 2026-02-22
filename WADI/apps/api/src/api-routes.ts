
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
import { updatePreferences } from "./controllers/user.controller";
import { getAdminMetrics } from "./controllers/metrics.controller";
import { rateLimiter, expensiveRateLimiter, adminRateLimiter, globalBudgetGuard } from "./middleware/rateLimiter";
const router = Router();
import { materializeProject, listProjectRuns } from "./controllers/execution.controller";
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

router.post(
  "/projects/:id/materialize",
  authenticate(),
  asyncHandler(materializeProject)
);

router.get(
  "/projects/:id/runs",
  authenticate(),
  asyncHandler(listProjectRuns)
);

/* =========================================
   RUNS / CHAT ROUTES
   ========================================= */

import { validate } from "./middleware/validate";
import { chatRunSchema } from "./schemas/chat.schema";
import { userPreferencesSchema } from "./schemas/user.schema";

// List Runs (History)
router.get(
  "/projects/:id/runs",
  authenticate(),
  asyncHandler(listRuns)
);

// New Chat Run (Stream) — optional auth, guests allowed
router.post(
  "/projects/:id/runs", 
  authenticate(true), 
  validate(chatRunSchema),
  handleChatStream
);

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
  validate(userPreferencesSchema),
  asyncHandler(updatePreferences)
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

/* =========================================
   SYSTEM / ADMIN ROUTES
   ========================================= */

router.get(
  "/admin/metrics",
  authenticate(),
  requireScope("admin:*"),
  adminRateLimiter,
  asyncHandler(getAdminMetrics)
);

export default router;
