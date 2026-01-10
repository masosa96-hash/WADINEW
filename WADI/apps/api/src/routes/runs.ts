import { Router } from "express";
import { listRuns, createRun } from "../controllers/runsController";
import { authenticate } from "../middleware/auth-beta";

const router = Router();

router.use(authenticate());

// Mounted at /api usually, so path includes projects/:id/runs
router.get("/projects/:id/runs", listRuns);
router.post("/projects/:id/runs", createRun);

export default router;
