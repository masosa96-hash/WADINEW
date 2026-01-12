import { Router } from "express";
import { ProjectsController } from "./project.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// Apply Auth Guard Globally to Project Routes
router.use(authenticate());

router.get("/", ProjectsController.list);
router.post("/", ProjectsController.create);
router.get("/:id", ProjectsController.get);
router.patch("/:id", ProjectsController.update);
router.delete("/:id", ProjectsController.delete);

export default router;
