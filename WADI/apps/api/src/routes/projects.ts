import { Router } from "express";
import { listProjects, createProject } from "../controllers/projectsController";
import { authenticate } from "../middleware/auth-beta";

const router = Router();

router.use(authenticate());

router.get("/", listProjects);
router.post("/", createProject);

export default router;
