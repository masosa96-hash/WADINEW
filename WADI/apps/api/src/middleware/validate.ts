import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { logger } from "../core/logger";

export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn({ 
          msg: "validation_failed", 
          errors: error.errors,
          path: req.path,
          method: req.method
        }, "Request validation failed");

        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          details: error.errors.map(e => ({
            path: e.path,
            message: e.message
          }))
        });
      }
      return next(error);
    }
  };
