
import { Router, Request, Response, NextFunction } from "express";
import { authenticate, AuthenticatedRequest } from "./middleware/auth";
import { requireScope } from "./middleware/require-scope";

// Controllers
import {
  listProjects,
  getProject,
  crystallizeProject,
  bulkDeleteProjects,
} from "./controllers/project.controller";
import {
  listConversations,
  getConversation,
  deleteConversation,
  bulkDeleteConversations,
} from "./controllers/conversation.controller";
import { handleChatStream } from "./controllers/ai.controller";
import { listRuns } from "./controllers/runsController"; // Existing controller

const router = Router();

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
  asyncHandler(crystallizeProject)
);

router.delete(
  "/projects/bulk",
  authenticate(),
  asyncHandler(bulkDeleteProjects)
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

// New Chat Run (Stream)
router.post("/projects/:id/runs", authenticate(), handleChatStream);

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

export default router;
