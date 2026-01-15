import { Router } from "express";
import { listProjects, createProject } from "../controllers/projectsController";
import { authenticate } from "../middleware/auth-beta";
import { crystallize } from "../controllers/projectsController";


const router = Router();

router.use(authenticate());

router.get("/", listProjects);
router.post("/", createProject);
router.post("/crystallize", crystallize);


export default router;
