import { Router } from "express";
import { ProjectsController } from "./project.controller";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validation.middleware";
import { createProjectSchema, updateProjectSchema } from "@wadi/core";

const router = Router();

// Apply Auth Guard Globally to Project Routes
router.use(authenticate());

router.get("/", ProjectsController.list);
router.post("/", validate(createProjectSchema), ProjectsController.create);
router.get("/:id", ProjectsController.get);
router.patch("/:id", validate(updateProjectSchema), ProjectsController.update);
router.delete("/:id", ProjectsController.delete);

export default router;
