import { Request, Response, NextFunction } from "express";
import { ProjectsService } from "./project.service";
import { AuthenticatedRequest } from "../../middleware/auth";

export class ProjectsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthenticatedRequest).user;
      const projects = await ProjectsService.list(user!.id);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthenticatedRequest).user;
      const project = await ProjectsService.create(user!.id, req.body);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params;
      const project = await ProjectsService.get(user!.id, id);
      
      if (!project) {
        return res.status(404).json({ error: "Proyect not found" });
      }
      
      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params;
      const project = await ProjectsService.update(user!.id, id, req.body);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params;
      await ProjectsService.delete(user!.id, id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
