
import { Router, Request, Response, NextFunction } from "express";
import { authenticate, AuthenticatedRequest } from "./middleware/auth";
import { requireScope } from "./middleware/require-scope";
import { supabase } from "./supabase";

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
import { handleWadiInterpret, handleWadiReset } from "./controllers/wadi.controller";
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

import { generatePRD } from "./controllers/project.controller";
import { exportProject } from "./controllers/export.controller";
import { analyzeIdea, generateProject } from "./services/aiEngine"; // New AI Engine integrations

router.post(
  "/projects/analyze",
  authenticate(),
  asyncHandler(async (req, res) => {
    const { ideaId, description } = req.body;
    const result = await analyzeIdea(ideaId, description);
    res.json(result);
  })
);

router.post(
  "/projects/generate",
  authenticate(),
  asyncHandler(async (req, res) => {
    const { playbook } = req.body;
    const result = await generateProject(playbook);
    res.json(result);
  })
);

import { createRepo } from "./services/githubRepo";
import { pushRepo } from "./services/gitPush";

router.post(
  "/projects/publish",
  authenticate(),
  asyncHandler(async (req, res) => {
    const { playbook } = req.body;
    const userId = req.user!.id;
    
    // We already generated the project locally with the previous endpoint, or we do it here. 
    // The user flow describes: project = await generateProject(ideaId/playbook). So we assume generation happens here or we get the path from the client.
    // For now we'll match the user's pseudo-code workflow explicitly.
    const project = await generateProject(playbook);
    
    // Attempting to fetch their github token from DB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ghAccount } = await (supabase as any)
      .from("github_accounts")
      .select("access_token")
      .eq("user_id", userId)
      .single();

    if (!ghAccount || !ghAccount.access_token) {
      return res.status(400).json({ error: "No GitHub token mapped to this user. Please connect GitHub first." });
    }

    // Creating the repo using the idea title or a fallback naming convention
    const repoName = `wadi-project-${Date.now().toString().slice(-4)}`;
    const repo = await createRepo(ghAccount.access_token, repoName);

    // Initial Push generated code to that repo
    const authUrl = repo.clone_url.replace("https://", `https://x-access-token:${ghAccount.access_token}@`);
    await pushRepo(project.path, authUrl);

    res.json({
      status: "published",
      repoUrl: repo.html_url,
      repoName: repoName,
      projectPath: project.path // Pass path so client knows it
    });
  })
);

import { setupVercelProject, deployToVercel } from "./services/vercelDeploy";
import { deployToRailway } from "./services/railwayDeploy";

router.post(
  "/projects/deploy",
  authenticate(),
  asyncHandler(async (req, res) => {
    const { projectId, repoUrl, repoName, playbook } = req.body;
    let fallbackDeployUrl = "";

    // Parse stack requirements from playbook
    const stackInfo = playbook?.tech_stack || {};
    let providerUsed = "unknown";

    if (stackInfo.frontend === "nextjs" || stackInfo.frontend?.includes("react")) {
       // Auto-deploy to Vercel
       providerUsed = "vercel";
       const vercelProject = await setupVercelProject(repoName, "nextjs");
       
       // Force trigger production deployment
       const deployment = await deployToVercel(vercelProject?.name || repoName);
       if (deployment?.url) {
           fallbackDeployUrl = `https://${deployment.url}`;
       }
    } else if (stackInfo.backend === "fastapi" || stackInfo.backend?.includes("python")) {
       // Auto-deploy Railway
       providerUsed = "railway";
       const deployment = await deployToRailway(repoUrl);
       if (deployment?.url) {
           fallbackDeployUrl = deployment.url;
       }
    } else {
       // Default fallback
       providerUsed = "vercel";
       await setupVercelProject(repoName, "other");
       const deployment = await deployToVercel(repoName);
       if (deployment?.url) {
           fallbackDeployUrl = `https://${deployment.url}`;
       }
    }

    // Save Deployment Record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: deploymentRecord } = await (supabase as any)
      .from("deployments")
      .insert({
         project_id: projectId, // Project ID from internal Wadi Tracking
         provider: providerUsed,
         deploy_url: fallbackDeployUrl,
      })
      .select()
      .single();

    res.json({
      status: "deploying",
      provider: providerUsed,
      url: fallbackDeployUrl,
      deploymentId: deploymentRecord?.id
    });
  })
);

router.get(
  "/deployments/:id/status",
  authenticate(),
  asyncHandler(async (req, res) => {
     // Optional endpoint to poll Vercel API internally, or just return existing DB state.
     const { id } = req.params;
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     const { data: deployment } = await (supabase as any)
        .from("deployments")
        .select("*")
        .eq("id", id)
        .single();
        
     if (!deployment) return res.status(404).json({ error: "Deploy not found" });

     // Basic pass-through (if vercel is the provider, we could fetch from VERCEL directly if we saved the Vercel internal ID)
     // Right now just returning our DB snapshot.
     res.json(deployment);
  })
);

router.post(
  "/projects/:id/prd",
  authenticate(),
  asyncHandler(generatePRD)
);

router.get(
  "/projects/:id/export",
  authenticate(),
  asyncHandler(exportProject)
);

import {
  getProjectGenome,
  getProjectFeed,
  getProjectInsights,
  getProjectPRs,
  triggerEvolution,
} from "./controllers/evolution.controller";

router.get("/projects/:id/genome", authenticate(), asyncHandler(getProjectGenome));
router.get("/projects/:id/feed", authenticate(), asyncHandler(getProjectFeed));
router.get("/projects/:id/insights", authenticate(), asyncHandler(getProjectInsights));
router.get("/projects/:id/prs", authenticate(), asyncHandler(getProjectPRs));
router.post("/projects/:id/evolve", authenticate(), asyncHandler(triggerEvolution));

/* =========================================
   WADI PIPELINE ROUTES
   ========================================= */

// Procesar mensaje del usuario → AI Engine → Supabase
router.post(
  "/wadi/interpret",
  authenticate(true),
  rateLimiter,
  asyncHandler(handleWadiInterpret)
);

// Reiniciar estado conversacional del usuario
router.post(
  "/wadi/reset",
  authenticate(true),
  asyncHandler(handleWadiReset)
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

import githubRoutes from "./routes/github";
router.use("/auth/github", githubRoutes);

export default router;
